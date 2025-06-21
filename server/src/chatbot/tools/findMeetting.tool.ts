import { PrismaService } from 'src/prisma/prisma.service';
import { tool } from 'ai';
import { z } from 'zod';

export type FindMeetingListResponseType = {
  id: string;
  title: string | null;
  createdBy: string | null;
  createdAt: Date;
};

export type FindMeetingListSchemaType = {
  projectId: string;
  limit?: number;
};

export const getFindMeetingListTool = (prisma: PrismaService) =>
  tool({
    description: 'Fetches the last N meetings for a project (defaults to 3).',
    parameters: z.object({
      projectId: z
        .string()
        .describe('The ID of the project to find meetings for.'),
      limit: z
        .number()
        .optional()
        .describe('Number of meetings to fetch. Default is 3.'),
    }),
    execute: async ({ projectId, limit = 3 }: FindMeetingListSchemaType) => {
      try {
        const meetings = await prisma.meeting_data.findMany({
          where: {
            project_id: projectId,
          },
          orderBy: {
            created_at: 'desc',
          },
          take: limit,
          select: {
            id: true,
            title: true,
            created_at: true,
            creator: {
              select: {
                first_name: true,
                last_name: true,
              },
            },
          },
        });

        const formattedMeetings: FindMeetingListResponseType[] = meetings.map(
          (meeting) => ({
            id: meeting.id,
            title: meeting.title,
            createdBy: meeting.creator
              ? `${meeting.creator.first_name} ${meeting.creator.last_name}`
              : null,
            createdAt: meeting.created_at,
          }),
        );

        return formattedMeetings;
      } catch (error) {
        console.error('Error fetching meetings:', error);
        return {
          error: 'Unable to fetch meetings. Please try again.',
        };
      }
    },
  });
