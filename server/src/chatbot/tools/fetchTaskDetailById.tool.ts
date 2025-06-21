import { PrismaService } from 'src/prisma/prisma.service';
import { tool } from 'ai';
import { z } from 'zod';

export type FetchTaskDetailResponseType = {
  id: string;
  title: string;
  description: string;
  projectId: string;
  sprintId: string;
  createdAt: Date;
  stories: {
    id: string;
    title: string;
    description: string;
    projectId: string;
    sprintId: string;
    taskId: string;
    createdAt: Date;
  }[];
};

export type FetchTaskDetailSchemaType = {
  taskId: string;
};

export const getFetchTaskDetailByIdTool = (prisma: PrismaService) =>
  tool({
    description: 'Fetches a task and its associated stories by taskId.',
    parameters: z.object({
      taskId: z.string().describe('The ID of the task to fetch details for.'),
    }),
    execute: async ({ taskId }: FetchTaskDetailSchemaType) => {
      if (!taskId.trim()) {
        return JSON.stringify({ error: 'taskId is required.' });
      }
      try {
        const taskWithStories = await prisma.task.findUnique({
          where: { id: taskId },
          select: {
            id: true,
            title: true,
            description: true,
            project_id: true,
            sprint_id: true,
            created_at: true,
            stories: {
              select: {
                id: true,
                title: true,
                description: true,
                project_id: true,
                sprint_id: true,
                task_id: true,
                created_at: true,
              },
            },
          },
        });

        if (!taskWithStories) {
          return { error: 'Task not found.' };
        }

        const response: FetchTaskDetailResponseType = {
          id: taskWithStories.id,
          title: taskWithStories.title,
          description: taskWithStories.description ?? '',
          projectId: taskWithStories.project_id,
          sprintId: taskWithStories.sprint_id ?? '',
          createdAt: taskWithStories.created_at,
          stories: (taskWithStories.stories || []).map((story) => ({
            id: story.id,
            title: story.title,
            description: story.description ?? '',
            projectId: story.project_id,
            sprintId: story.sprint_id ?? '',
            taskId: story.task_id ?? '',
            createdAt: story.created_at,
          })),
        };

        return response;
      } catch (error) {
        console.error('Error fetching task and stories:', error);
        return {
          error: 'Unable to fetch task details. Please try again.',
        };
      }
    },
  });
