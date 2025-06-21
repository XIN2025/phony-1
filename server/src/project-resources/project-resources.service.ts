import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { project_resources } from '@prisma/client';
import { MailService } from 'src/mail/mail.service';
import {
  PROJECT_RESOURCE_ADDED_TEMPLATE,
  PROJECT_RESOURCE_MEETING_REMINDER_TEMPLATE,
} from 'src/mail/templates/project-resource';
import { SchedulerService } from 'src/helper/scheduler.service';
import { format } from 'date-fns';
import { emailTemplateWrapper } from 'src/mail/templates/wrapper';

@Injectable()
export class ProjectResourcesService {
  private readonly logger = new Logger(ProjectResourcesService.name);
  constructor(
    private prismaService: PrismaService,
    private mailService: MailService,
    private schedulerService: SchedulerService,
  ) {}

  async createProjectResource(
    projectId: string,
    resourceType: string,
    resourceURL: string,
    resourceName: string,
    userEmail: string,
    meetingData: {
      scheduleType?: string;
      scheduleTime?: string;
      scheduleDays?: string[];
      scheduleDate?: Date;
      cronExpression?: string;
    },
  ): Promise<project_resources> {
    const project = await this.prismaService.projects.findUnique({
      where: {
        id: projectId,
      },
      select: {
        title: true,
      },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    const resource = await this.prismaService.project_resources.create({
      data: {
        project_id: projectId,
        resource_type: resourceType,
        resource_url: resourceURL,
        resource_name: resourceName,
        isActive: true,
        schedule_type: meetingData?.scheduleType,
        schedule_time: meetingData?.scheduleTime,
        schedule_days: meetingData?.scheduleDays,
        schedule_date: meetingData?.scheduleDate,
        cron_expression: meetingData?.cronExpression,
      },
    });
    if (
      meetingData.scheduleType === 'recurring' ||
      meetingData.scheduleType === 'daily'
    ) {
      this.schedulerService.createCronSchedule({
        eventId: resource.id + '-meeting',
        cronExpression: meetingData.cronExpression,
        payload: {
          resourceId: resource.id,
          callbackUrl: `${process.env.NEXT_PUBLIC_API_URL}/project-resources/meeting/reminder`,
        },
        startDate: meetingData.scheduleDate || undefined,
        timezone: 'Asia/Kolkata',
      });
    }
    const members = await this.prismaService.project_members.findMany({
      where: {
        project_id: projectId,
        user_email: {
          not: userEmail,
        },
      },
      include: {
        users: true,
      },
    });
    members.forEach(async (member) => {
      if (!member.users) return;
      this.logger.log(`Sending email to ${member.user_email}`);
      await this.mailService.sendTemplateMail({
        to: member.user_email,
        subject: `New Resource Added to ${project.title}`,
        template: emailTemplateWrapper(PROJECT_RESOURCE_ADDED_TEMPLATE),
        context: {
          recipientName: member.users.first_name,
          resourceName: resourceName,
          projectName: project.title,
          resourceType: resourceType,
          resourceUrl: resourceURL,
        },
      });
    });
    return resource;
  }

  async getProjectResources(projectId: string): Promise<project_resources[]> {
    return this.prismaService.project_resources.findMany({
      where: {
        project_id: projectId,
        isActive: true,
      },
    });
  }

  async getProjectResourceById(
    resourceId: string,
  ): Promise<project_resources | null> {
    return this.prismaService.project_resources.findUnique({
      where: {
        id: resourceId,
        isActive: true,
      },
    });
  }

  async updateProjectResource(
    resourceId: string,
    resourceType: string,
    resourceURL: string,
    resourceName: string,
    meetingData: {
      scheduleType?: string;
      scheduleTime?: string;
      scheduleDays?: string[];
      scheduleDate?: Date;
      cronExpression?: string;
    },
  ): Promise<project_resources> {
    const resource = await this.prismaService.project_resources.update({
      where: {
        id: resourceId,
      },
      data: {
        resource_type: resourceType,
        resource_url: resourceURL,
        resource_name: resourceName,
        updated_at: new Date(),
        schedule_type: meetingData?.scheduleType,
        schedule_time: meetingData?.scheduleTime,
        schedule_days: meetingData?.scheduleDays,
        schedule_date: meetingData?.scheduleDate,
        cron_expression: meetingData?.cronExpression,
      },
    });
    if (
      meetingData.scheduleType === 'recurring' ||
      meetingData.scheduleType === 'daily'
    ) {
      this.schedulerService.createCronSchedule({
        eventId: resource.id + '-meeting',
        cronExpression: meetingData.cronExpression,
        payload: {
          resourceId: resource.id,
          callbackUrl: `${process.env.NEXT_PUBLIC_API_URL}/project-resources/meeting/reminder`,
        },
        startDate: meetingData.scheduleDate || undefined,
        timezone: 'Asia/Kolkata',
      });
    } else {
      this.schedulerService.deleteSchedule(resource.id + '-meeting');
    }
    return resource;
  }

  async deleteProjectResource(resourceId: string): Promise<project_resources> {
    const meetingData = await this.prismaService.meeting_data.findMany({
      where: {
        resource_id: resourceId,
      },
      select: {
        id: true,
      },
    });
    this.schedulerService.deleteSchedule(resourceId + '-meeting');
    if (meetingData.length > 0) {
      return this.prismaService.project_resources.update({
        where: {
          id: resourceId,
        },
        data: {
          isActive: false,
        },
      });
    } else {
      return this.prismaService.project_resources.delete({
        where: {
          id: resourceId,
        },
      });
    }
  }

  async meetingReminder(resourceId: string) {
    const resource = await this.prismaService.project_resources.findUnique({
      where: {
        id: resourceId,
      },
      include: {
        projects: true,
      },
    });
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    const members = await this.prismaService.project_members.findMany({
      where: {
        project_id: resource.project_id,
      },
      include: {
        users: true,
      },
    });
    members.forEach(async (member) => {
      if (!member.users) return;
      this.logger.log(`Sending email to ${member.user_email}`);
      await this.mailService.sendTemplateMail({
        to: member.user_email,
        subject: `⏰ Meeting Reminder: ${resource.projects.title}`,
        template: emailTemplateWrapper(
          PROJECT_RESOURCE_MEETING_REMINDER_TEMPLATE,
        ),
        context: {
          recipientName: member.users.first_name,
          projectName: resource.projects.title,
          meetingName: resource.resource_name,
          meetingUrl: resource.resource_url,
          meetingTime: resource.schedule_time
            ? format(
                new Date(`2000-01-01T${resource.schedule_time}`),
                'hh:mm a',
              )
            : null,
        },
      });
    });
    return resource;
  }
}
