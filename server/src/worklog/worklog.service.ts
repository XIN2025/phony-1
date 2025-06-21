import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { WorklogDto } from 'src/tasks/dto/user-stories.dto';
import axios, { isAxiosError } from 'axios';
import {
  CreateWorklogDto,
  UpdateWorklogDto,
  WorklogParams,
} from './dtos/worklog.dto';
import { RequestUser } from 'src/auth/decorators/user.decorator';
import { Prisma } from '@prisma/client';
import { getTimezoneOffset } from 'src/common/utils/utils.util';

const includeStatement = {
  project: {
    select: {
      unique_name: true,
    },
  },
  bug: {
    select: {
      id: true,
      title: true,
      summary: true,
    },
  },
  story: {
    select: {
      id: true,
      title: true,
      description: true,
    },
  },
  meeting: {
    select: {
      id: true,
      title: true,
      metadata: true,
    },
  },
  wiki: {
    select: {
      id: true,
      title: true,
    },
  },
  user: {
    select: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
      avatar_url: true,
    },
  },
};

@Injectable()
export class WorklogService {
  logger = new Logger(WorklogService.name);
  constructor(private readonly prisma: PrismaService) {}

  async createWorklog(data: CreateWorklogDto, user: RequestUser) {
    const worklog = await this.prisma.worklog.create({
      data: {
        projectId: data.projectId,
        hoursWorked: data.hoursWorked,
        description: data.description,
        date: data.date,
        bugId: data.bugId,
        storyId: data.storyId,
        meetingId: data.meetingId,
        wikiId: data.wikiId,
        userId: user.id,
      },
      include: includeStatement,
    });
    await this.createWorklogInWorkLog({
      projectName: worklog.project.unique_name,
      userEmail: user.email,
      hoursWorked: data.hoursWorked,
      description: data.description,
      storyId: data.storyId,
      bugId: data.bugId,
      meetingId: data.meetingId,
      wikiId: data.wikiId,
    });
    return worklog;
  }

  async updateWorklog(id: string, data: UpdateWorklogDto, user: RequestUser) {
    const worklog = await this.prisma.worklog.update({
      where: { id, userId: user.id },
      data,
      include: includeStatement,
    });
    return worklog;
  }

  async deleteWorklog(id: string) {
    await this.prisma.worklog.delete({
      where: { id },
    });
    return true;
  }

  async getWorklogsByUserId(id: string, params: WorklogParams) {
    const whereClause: Prisma.WorklogWhereInput = { userId: id };
    if (params.projectName) {
      whereClause.project = { unique_name: params.projectName };
    }
    if (params.date) {
      const timezoneOffset = getTimezoneOffset(params.timezone);
      // start of the day  according to params.timezone
      const startDate = new Date(params.date);
      startDate.setHours(0, 0, 0, 0);
      startDate.setMinutes(startDate.getMinutes() - timezoneOffset);
      // end of the day according to params.timezone
      const endDate = new Date(params.date);
      endDate.setHours(23, 59, 59, 999);
      endDate.setMinutes(endDate.getMinutes() - timezoneOffset);
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    }
    const worklogs = await this.prisma.worklog.findMany({
      where: whereClause,
      include: includeStatement,
      orderBy: {
        hoursWorked: 'desc',
      },
    });
    return worklogs;
  }
  private async createWorklogInWorkLog(worklog: WorklogDto) {
    try {
      const formdata = new FormData();
      formdata.append('projectName', worklog.projectName);
      formdata.append('userEmail', worklog.userEmail);
      formdata.append('description', worklog.description);
      formdata.append('hoursWorked', worklog.hoursWorked.toString());
      if (worklog.storyId) {
        formdata.append('storyId', worklog.storyId);
      }
      if (worklog.bugId) {
        formdata.append('bugId', worklog.bugId);
      }
      if (worklog.meetingId) {
        formdata.append('meetingId', worklog.meetingId);
      }
      if (worklog.wikiId) {
        formdata.append('wikiId', worklog.wikiId);
      }

      const response = await axios.post(
        `${process.env.WORKLOG_API_URL}/api/add-worklog`,
        formdata,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        this.logger.error(`Failed to create worklog: ${error.response.data}`);
      } else {
        this.logger.error(`Failed to create worklog: ${error.message}`);
      }
    }
  }
}
