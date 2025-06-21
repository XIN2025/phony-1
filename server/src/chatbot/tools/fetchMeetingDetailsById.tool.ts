import { PrismaService } from 'src/prisma/prisma.service';
import { tool } from 'ai';
import { z } from 'zod';

export type FetchMeetingDetailsResponseType = {
  id: string;
  title: string | null;
  createdBy: string | null;
  createdAt: Date;
  summary: string | null;
};

export type FetchMeetingDetailsSchemaType = {
  meetingId: string;
};

export const getFetchMeetingDetailsByIdTool = (prisma: PrismaService) =>
  tool({
    description: 'Fetches the details of a meeting by its ID.',
    parameters: z.object({
      meetingId: z
        .string()
        .describe('The ID of the meeting to fetch details for.'),
    }),
    execute: async ({ meetingId }: FetchMeetingDetailsSchemaType) => {
      try {
        const meeting = await prisma.meeting_data.findUnique({
          where: { id: meetingId },
          select: {
            id: true,
            title: true,
            created_at: true,
            summary: true,
            creator: {
              select: {
                first_name: true,
                last_name: true,
              },
            },
          },
        });

        if (!meeting) {
          return {
            error: 'Meeting not found. Please check the meeting ID.',
          };
        }

        const formattedMeeting: FetchMeetingDetailsResponseType = {
          id: meeting.id,
          title: meeting.title,
          createdBy: meeting.creator
            ? `${meeting.creator.first_name} ${meeting.creator.last_name}`
            : null,
          createdAt: meeting.created_at,
          summary: meeting.summary,
        };

        return formattedMeeting;
      } catch (error) {
        console.error('Error fetching meeting details:', error);
        return {
          error: 'Unable to fetch meeting details. Please try again.',
        };
      }
    },
  });
