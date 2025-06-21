import { PrismaService } from 'src/prisma/prisma.service';
import { tool } from 'ai';
import { z } from 'zod';

export type FetchSprintDetailsResponseType = {
  id: string;
  name: string;
  requirements: string | null;
  status: string;
  startDate: Date;
  endDate: Date;
  payment: string;
  feedback: string | null;
  userPersonas: any | null;
  taskStatus: string;
  sprintNumber: number;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
  tasks: {
    id: string;
    title: string;
    type: string;
    description: string | null;
    storyStatus: string;
    stories: {
      id: string;
      title: string;
      description: string;
      priority: number;
      assignee: {
        id: string;
        firstName: string;
        lastName: string;
      } | null;
      status: string;
      estimation: number;
    }[];
  }[];
};

export type FetchSprintDetailsByIdSchemaType = {
  sprintId: string;
};

export const getFetchSprintDetailsByIdTool = (prisma: PrismaService) =>
  tool({
    description:
      'Fetches detailed information for a sprint by its ID, including related tasks and stories.',
    parameters: z.object({
      sprintId: z
        .string()
        .describe('The ID of the sprint to fetch details for.'),
    }),
    execute: async ({ sprintId }: FetchSprintDetailsByIdSchemaType) => {
      try {
        const sprint = await prisma.sprints.findUnique({
          where: {
            id: sprintId,
          },
          select: {
            id: true,
            name: true,
            requirements: true,
            status: true,
            start_date: true,
            end_date: true,
            payment: true,
            feedback: true,
            user_personas: true,
            task_status: true,
            sprint_number: true,
            created_at: true,
            updated_at: true,
            project_id: true,
            tasks: {
              select: {
                id: true,
                title: true,
                type: true,
                description: true,
                story_status: true,
                stories: {
                  select: {
                    id: true,
                    title: true,
                    description: true,
                    priority: true,
                    assignee: {
                      select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                      },
                    },
                    status: true,
                    estimation: true,
                  },
                },
              },
            },
          },
        });

        if (!sprint) {
          return { error: 'Sprint not found.' };
        }

        const formattedSprint: FetchSprintDetailsResponseType = {
          id: sprint.id,
          name: sprint.name,
          requirements: sprint.requirements,
          status: String(sprint.status),
          startDate: sprint.start_date,
          endDate: sprint.end_date,
          payment: String(sprint.payment),
          feedback: sprint.feedback,
          userPersonas: sprint.user_personas,
          taskStatus: String(sprint.task_status),
          sprintNumber: sprint.sprint_number,
          createdAt: sprint.created_at,
          updatedAt: sprint.updated_at,
          projectId: sprint.project_id,
          tasks: sprint.tasks.map((task) => ({
            id: task.id,
            title: task.title,
            type: String(task.type),
            description: task.description,
            storyStatus: String(task.story_status),
            stories: task.stories.map((story) => ({
              id: story.id,
              title: story.title,
              description: story.description,
              priority: story.priority,
              assignee: story.assignee
                ? {
                    id: story.assignee.id,
                    firstName: story.assignee.first_name,
                    lastName: story.assignee.last_name,
                  }
                : null,
              status: String(story.status),
              estimation: story.estimation,
            })),
          })),
        };

        return formattedSprint;
      } catch (error) {
        console.error('Error fetching sprint details:', error);
        return {
          error: 'Unable to fetch sprint details. Please try again.',
        };
      }
    },
  });
