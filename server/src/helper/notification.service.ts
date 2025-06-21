import { Injectable } from '@nestjs/common';
import { projects } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { PROGRESS_SUMMARY_TEMPLATE } from 'src/mail/templates/progress-summary';
import { emailTemplateWrapper } from 'src/mail/templates/wrapper';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_10PM)
  async sendProgressSummary() {
    // get all the projects
    const projects = await this.prisma.projects.findMany({
      where: {
        OR: [
          {
            is_archived: false,
          },
          {
            is_archived: {
              isSet: false,
            },
          },
        ],
      },
    });
    await Promise.all(
      projects.map(async (project) => {
        await this.sendProgressNotification(project);
      }),
    );
  }

  async sendProgressNotification(project: projects) {
    try {
      // Get stories completed today

      const stories = await this.prisma.story.findMany({
        where: {
          project_id: project.id,
          status: 'Done',
          OR: [
            {
              isEmailSent: false,
            },
            {
              isEmailSent: {
                isSet: false,
              },
            },
          ],
        },
      });

      if (stories.length === 0) {
        return;
      }
      console.log(`Sending progress notification for ${project.title}`);
      await this.prisma.story.updateMany({
        where: {
          project_id: project.id,
          status: 'Done',
          OR: [
            {
              isEmailSent: false,
            },
            {
              isEmailSent: {
                isSet: false,
              },
            },
          ],
        },
        data: {
          isEmailSent: true,
        },
      });
      let members = await this.prisma.project_members.findMany({
        where: {
          project_id: project.id,
          role: 'Admin',
        },
        select: {
          user_email: true,
          users: {
            select: {
              id: true,
              last_name: true,
              first_name: true,
            },
          },
        },
      });

      members = members.filter((member) => member.users);
      if (members.length === 0) return;

      // Prepare email data
      const formattedStories = stories.map((story) => ({
        title: story.title,
        description: story.description || '',
      }));

      const projectLink = `${process.env.FRONTEND_URL}/dashboard/project/${project.unique_name}`;

      // Send emails to all admin members
      for (const member of members) {
        const recipientName = `${member.users.first_name} ${member.users.last_name}`;

        const context = {
          recipientName,
          projectName: project.title,
          completedCount: stories.length,
          stories: formattedStories,
          projectLink,
        };

        const renderedTemplate = this.renderTemplate(
          PROGRESS_SUMMARY_TEMPLATE,
          context,
        );
        const html = emailTemplateWrapper(renderedTemplate);

        await this.mailService.sendMail({
          to: member.user_email,
          subject: `Daily Progress: ${stories.length} ${stories.length === 1 ? 'Story' : 'Stories'} Completed in ${project.title}`,
          html,
        });
      }
    } catch (error) {
      console.error(
        `Error sending progress notification for ${project.title}:`,
        error,
      );
    }
  }

  private renderTemplate(
    template: string,
    context: Record<string, any>,
  ): string {
    let rendered = template;

    // Handle simple variable replacements
    Object.entries(context).forEach(([key, value]) => {
      if (key !== 'stories') {
        rendered = rendered.replace(
          new RegExp(`{{${key}}}`, 'g'),
          String(value),
        );
      }
    });

    // Handle stories array
    if (context.stories && Array.isArray(context.stories)) {
      const storiesHtml = context.stories
        .map(
          (story) => `
        <div style="background: #ffffff; padding: 16px; border-radius: 6px; border: 1px solid #e5e7eb; margin-bottom: 12px;">
          <div style="font-size: 16px; font-weight: 500; color: #111827; margin-bottom: 8px;">${story.title}</div>
          ${story.description ? `<div style="font-size: 14px; color: #6b7280; margin-top: 8px; padding-top: 8px; border-top: 1px solid #f3f4f6;">${story.description}</div>` : ''}
        </div>`,
        )
        .join('');

      rendered = rendered.replace(
        /{{#each stories}}[\s\S]*?{{\/each}}/g,
        storiesHtml,
      );
    }

    return rendered;
  }
}
