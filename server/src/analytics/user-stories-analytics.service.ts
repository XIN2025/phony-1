import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum UserStoryEventType {
  CREATED_MANUAL = 'CREATED_MANUAL',
  DELETED_MANUAL = 'DELETED_MANUAL',
}

interface UserStoryEvent {
  eventType: UserStoryEventType;
  projectId: string;
  actionBy?: string;
  data: any;
  eventDetails?: string;
}

@Injectable()
export class UserStoriesAnalyticsService {
  constructor(private prisma: PrismaService) {}

  async logUserStoryEvent(event: UserStoryEvent): Promise<void> {
    try {
      console.log('Logging user story event:', event.eventType);

      await this.prisma.user_story_analytics.create({
        data: {
          actionType: event.eventType,
          projectId: event.projectId,
          storyId: event.data.id,
          actionBy: event.actionBy,
          storyData: event.data,
          actionDetails: event.eventDetails,
        },
      });
    } catch (error) {
      console.error('Failed to log user story event:', error);
    }
  }

  async updateCreatedStoryById(data: any): Promise<void> {
    try {
      await this.prisma.user_story_analytics.updateMany({
        where: { storyId: data.id },
        data: {
          storyData: data,
        },
      });
    } catch (error) {
      console.error('Failed to update user story:', error);
    }
  }

  async getEventsData(projectId?: string) {
    try {
      return await this.prisma.user_story_analytics.findMany({
        where: projectId ? { projectId } : undefined,
        orderBy: {
          actionCreatedAt: 'desc',
        },
        include: {
          project: true,
          actionByUser: true,
        },
      });
    } catch (error) {
      console.error('Failed to read user story events:', error);
      return [];
    }
  }
}
