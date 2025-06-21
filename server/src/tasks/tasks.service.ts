import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  UserStoriesAnalyticsService,
  UserStoryEventType,
} from 'src/analytics/user-stories-analytics.service';
import { GenerateRequirementDto } from './dto/generate-requirement.dto';
import { GenerateStoriesDto } from './dto/generate-stories.dto';
import { GenerateAcceptanceCriteriaDto } from './dto/generate-acceptance-criteria.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { getModelType } from 'src/common/utils/utils.util';
import { HelperService } from 'src/helper/helper.service';
import {
  CreateTaskDto,
  mapToTaskDto,
  mapToUserStoriesDto,
  UpdateTaskDto,
} from './dto/tasks.dto';
import { CreateStoryDto, UpdateStoryDto } from './dto/user-stories.dto';
import { MailService } from 'src/mail/mail.service';
import { STORY_ASSIGNED_TEMPLATE } from 'src/mail/templates/story';
import { UserStoryStatus } from '@prisma/client';
import { emailTemplateWrapper } from 'src/mail/templates/wrapper';
import { generateObjectAI } from 'src/common/utils/llm.util';
import { prompts } from 'src/common/prompts';
import { z } from 'zod';
import { RequestUser } from 'src/auth/decorators/user.decorator';
type Task = {
  title: string;
  description: string;
  type: string;
};

type Story = {
  title: string;
  description: string;
  acceptanceCriteria?: { criteria: string }[];
};
@Injectable()
export class TasksService {
  logger = new Logger(TasksService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly helperService: HelperService,
    private readonly mailService: MailService,
    private readonly analyticsService: UserStoriesAnalyticsService,
  ) {}
  private getUserPrompt(
    projectName: string,
    requirements: string,
    thirdPartyIntegrations: string[],
    previousTasks: Task[],
  ) {
    return `<project>
  <name>${projectName}</name>
  ${thirdPartyIntegrations.length > 0 ? `<integrations>${thirdPartyIntegrations.join(',')}</integrations>` : ''}
  ${
    previousTasks.length > 0
      ? `<previous_tasks>${previousTasks
          .map(
            (requirement) => `
### ${requirement.title}
- Type: ${requirement.type}
- Description: ${requirement.description}`,
          )
          .join('\n')}</previous_tasks>`
      : ''
  }
  <requirements>${requirements}</requirements>
</project>`;
  }
  async generateTasks(dto: GenerateRequirementDto, fromCreateSprint?: boolean) {
    // checking if the project and sprint exist
    const project = await this.helperService.getExistingProject(dto.projectId);
    if (!project) {
      throw new HttpException('Project not found', 404);
    }
    const sprint = await this.prismaService.sprints.findUnique({
      where: {
        id: dto.sprintId,
      },
      include: {
        tasks: true,
      },
    });
    if (!sprint) {
      throw new HttpException('Sprint not found', 404);
    }
    if (sprint.tasks && sprint.tasks.length > 0 && !fromCreateSprint) {
      throw new HttpException('Sprint already has tasks', 400);
    }
    // updating the sprint status to generating
    await this.helperService.updateTaskStatus(dto.sprintId, 'Generating');
    // getting the previous tasks
    const prevTasks = await this.prismaService.task.findMany({
      where: {
        project_id: dto.projectId,
      },
    });
    const res = await generateObjectAI({
      model: getModelType(project.model_type),
      system: prompts.getGenerateTasksPrompt(),
      schema: z.object({
        tasks: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
            type: z.enum([
              'Feature',
              'Bug',
              'Research',
              'TechnicalDebt',
              'Documentation',
              'Investigation',
              'Refactor',
              'FutureEnhancement',
            ]),
          }),
        ),
      }),
      maxRetries: 3,
      prompt: this.getUserPrompt(
        project.title,
        sprint.requirements,
        project.third_party_integrations,
        prevTasks,
      ),
    });
    const tasks = res.tasks ?? [];
    if (tasks.length > 0) {
      await this.prismaService.task.createMany({
        data: tasks.map((task, index) => ({
          title: task.title,
          description: task.description,
          type: task.type,
          project_id: dto.projectId,
          sprint_id: dto.sprintId,
          order: index,
        })),
      });
    }
    this.logger.log('Tasks generated');
    await this.helperService.updateTaskStatus(dto.sprintId, 'Done');
  }
  async generateUserStories(dto: GenerateStoriesDto) {
    await this.helperService.updateStoryStatus(dto.taskId, 'Generating');
    // checking if the project and task exist
    const project = await this.helperService.getExistingProject(dto.projectId);
    if (!project) {
      await this.helperService.updateStoryStatus(dto.taskId, 'Done');
      throw new HttpException('Project not found', 404);
    }
    const task = await this.prismaService.task.findUnique({
      where: { id: dto.taskId },
      include: {
        stories: true,
        sprint: {
          select: {
            requirements: true,
          },
        },
        meeting_data: {
          select: {
            summary: true,
          },
        },
      },
    });
    if (!task) {
      await this.helperService.updateStoryStatus(dto.taskId, 'Done');
      throw new HttpException('Task not found', 404);
    }
    if (task.stories && task.stories.length > 0) {
      await this.prismaService.story.deleteMany({
        where: {
          task_id: dto.taskId,
        },
      });
    }
    const otherTasks = await this.prismaService.task.findMany({
      where: {
        sprint_id: task.sprint_id ?? null,
        id: {
          not: task.id,
        },
      },
      select: {
        title: true,
        description: true,
        type: true,
      },
    });

    try {
      const res = await generateObjectAI({
        model: getModelType(project.model_type),
        system: prompts.getGenerateStoriesPrompt(),
        schema: z.object({
          stories: z.array(
            z.object({
              title: z.string(),
              description: z.string(),
              estimation: z.number(),
              priority: z.number(),
              acceptance_criteria: z.array(z.string()),
              db_schema_prompt: z.string(),
              api_prompt: z.string(),
              ui_prompt: z.string(),
            }),
          ),
        }),
        prompt: this.getUserPromptForGenerateStories(
          project.title,
          task,
          project.project_context,
          otherTasks,
          task.meeting_data?.summary,
        ),
      });
      const stories = res.stories ?? [];
      // creating the stories
      if (stories.length > 0) {
        await this.prismaService.story.createMany({
          data: stories.map((story) => ({
            title: story.title,
            description: story.description,
            estimation: story.estimation,
            priority: story.priority,
            acceptance_criteria: story.acceptance_criteria?.map((c) => ({
              criteria: c,
              isCompleted: false,
            })),
            db_schema_prompt: story?.db_schema_prompt,
            api_prompt: story?.api_prompt,
            ui_prompt: story?.ui_prompt,
            status: 'Todo',
            task_id: dto.taskId,
            project_id: dto.projectId,
            sprint_id: task.sprint_id,
          })),
        });
        await this.prismaService.projects.update({
          where: { id: dto.projectId },
          data: {
            updated_at: new Date(),
          },
        });
      }
      // updating the task status to done
      await this.helperService.updateStoryStatus(dto.taskId, 'Done');
    } catch (error) {
      await this.helperService.updateStoryStatus(dto.taskId, 'Done');
      this.logger.error(`Failed to generate stories: ${error}`);
      throw new HttpException('Failed to generate stories', 500);
    }
  }
  private getUserPromptForGenerateStories(
    projectName: string,
    featureTask: Task,
    projectContext: string,
    otherTasks: Task[],
    meetingSummary?: string,
  ) {
    return `
<project_name>
${projectName}
</project_name>
<task>
${this.formatTask(featureTask)}
</task>
<other_tasks>
${this.formatOtherTasks(otherTasks).join('\n')}
</other_tasks>
<project_context>
${projectContext}
</project_context>
${meetingSummary ? `<meeting_summary>\n${meetingSummary}\n</meeting_summary>` : ''}
`;
  }
  private formatTask(task: Task) {
    return `\tTitle: ${task.title}\n\tDescription: ${task.description}\n\tType: ${task.type}`;
  }
  private formatOtherTasks(tasks: Task[]) {
    return tasks.map(
      (task) =>
        `\tTitle: ${task.title}\n\tDescription: ${task.description}\n\tType: ${task.type}`,
    );
  }
  async generateAcceptanceCriterion(dto: GenerateAcceptanceCriteriaDto) {
    // checking if the project and story exist
    const project = await this.helperService.getExistingProject(dto.projectId);
    if (!project) {
      throw new HttpException('Project not found', 404);
    }
    const story = await this.prismaService.story.findUnique({
      where: { id: dto.storyId },
    });
    if (!story) {
      throw new HttpException('Story not found', 404);
    }
    // checking if the story has acceptance criteria
    if (
      story.acceptance_criteria &&
      (story.acceptance_criteria as string[]).length > 0
    ) {
      throw new HttpException('Story already has acceptance criteria', 400);
    }
    // updating the story status to generating
    try {
      await this.helperService.updateAcceptanceCriteriaStatus(
        dto.storyId,
        'Generating',
      );
      const otherStories = await this.prismaService.story.findMany({
        where: {
          task_id: story.task_id,
          id: {
            not: story.id,
          },
        },
        select: {
          title: true,
          description: true,
        },
      });
      const res = await generateObjectAI({
        model: getModelType(project.model_type),
        system: prompts.getAcceptanceCriteriaPrompt(),
        schema: z.object({
          acceptance_criterion: z.array(z.string()),
        }),
        prompt: this.getUserMessage(
          {
            title: story.title,
            description: story.description,
          },
          otherStories,
        ),
      });
      const acceptanceCriterion = res.acceptance_criterion ?? [];

      if (acceptanceCriterion.length > 0) {
        await this.prismaService.story.update({
          where: { id: dto.storyId },
          data: {
            acceptance_criteria: acceptanceCriterion?.map((c) => ({
              criteria: c,
              isCompleted: false,
            })),
          },
        });
      }

      await this.helperService.updateAcceptanceCriteriaStatus(
        dto.storyId,
        'Done',
      );
    } catch (error) {
      await this.helperService.updateAcceptanceCriteriaStatus(
        dto.storyId,
        'Done',
      );
    }
  }
  getUserMessage(story: Story, otherStories: Story[]) {
    return `
    <user_story>
    ${this.formatStory(story)}
    </user_story>
    <other_stories>
    ${otherStories.map((s) => this.formatStory(s)).join('\n')}
    </other_stories>
    `;
  }

  private formatStory(story: Story) {
    return `<story>
  <title>${story.title}</title>
  <description>${story.description}</description>
  ${story.acceptanceCriteria ? `<acceptanceCriteria>${story.acceptanceCriteria.map((ac) => `<criterion>${ac.criteria}</criterion>`).join('')}</acceptanceCriteria>` : ''}
</story>`;
  }

  async createTask(dto: CreateTaskDto) {
    try {
      const task = await this.prismaService.task.create({
        data: {
          title: dto.title,
          description: dto.description,
          type: dto.type,
          project_id: dto.projectId,
          sprint_id: dto.sprintId,
        },
      });
      return mapToTaskDto(task);
    } catch (error) {
      throw new HttpException('Failed to create task', 500);
    }
  }

  async createStory(body: CreateStoryDto, user: RequestUser) {
    const story = await this.prismaService.story.create({
      data: {
        title: body.title,
        description: body.description,
        task_id: body.taskId,
        project_id: body.projectId,
        estimation: body.estimation,
        sprint_id: body.sprintId ?? null,
        acceptance_criteria: [],
        created_by: user.id,
      },
      include: {
        assignee: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            avatar_url: true,
            email: true,
          },
        },
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            avatar_url: true,
            email: true,
          },
        },
      },
    });

    this.analyticsService.logUserStoryEvent({
      eventType: UserStoryEventType.CREATED_MANUAL,
      projectId: body.projectId,
      eventDetails: `Manually created by ${user.email}`,
      data: story,
      actionBy: user.id,
    });

    await this.prismaService.projects.update({
      where: { id: body.projectId },
      data: {
        updated_at: new Date(),
      },
    });
    return mapToUserStoriesDto(story);
  }

  async updateStory(id: string, body: UpdateStoryDto, userId: string) {
    const story = await this.prismaService.story.findUnique({
      where: { id: id },
      include: {
        projects: true,
      },
    });
    if (!story) {
      throw new HttpException('Story not found', HttpStatus.NOT_FOUND);
    }
    if (body.assignedTo) {
      const assigned_to = await this.prismaService.users.findUnique({
        where: { id: body.assignedTo },
      });
      if (!assigned_to) {
        throw new HttpException('Assignee not found', HttpStatus.NOT_FOUND);
      }
      if (body.assignedTo !== story.assigned_to && body.assignedTo !== userId) {
        this.mailService.sendTemplateMail({
          to: assigned_to.email,
          template: emailTemplateWrapper(STORY_ASSIGNED_TEMPLATE),
          context: {
            recipientName: assigned_to.first_name,
            storyTitle: story.title,
            projectName: story.projects.title,
            priority: `P${story.priority}`,
            storyDescription: story.description,
            projectLink: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/project/${story.projects.unique_name}`,
          },
          subject: 'You have been assigned a new story',
        });
      }
    }

    const updatedStory = await this.prismaService.story.update({
      where: { id: id },
      data: {
        title: body.title,
        description: body.description,
        estimation: body.estimation,
        priority: body.priority,
        acceptance_criteria: JSON.parse(
          JSON.stringify(body.acceptanceCriteria),
        ),
        status: body.status as UserStoryStatus,
        db_schema_prompt: body.dbSchemaPrompt,
        api_prompt: body.apiPrompt,
        ui_prompt: body.uiPrompt,
        assigned_to: body.assignedTo ?? null,
        updated_at: new Date(),
      },
      include: {
        assignee: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            avatar_url: true,
            email: true,
          },
        },
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            avatar_url: true,
            email: true,
          },
        },
      },
    });
    this.analyticsService.updateCreatedStoryById(updatedStory);
    return mapToUserStoriesDto(updatedStory);
  }

  async updateStoryTask(id: string, taskId: string) {
    const story = await this.prismaService.story.findUnique({
      where: { id: id },
    });
    if (!story) {
      throw new HttpException('Story not found', HttpStatus.NOT_FOUND);
    }
    const updatedStory = await this.prismaService.story.update({
      where: { id: id },
      data: { task_id: taskId },
    });
    return mapToUserStoriesDto(updatedStory);
  }

  async deleteStory(id: string, user: RequestUser) {
    const story = await this.prismaService.story.findUnique({
      where: { id: id },
    });

    if (story) {
      // Log analytics before deleting the story
      this.analyticsService.logUserStoryEvent({
        eventType: UserStoryEventType.DELETED_MANUAL,
        projectId: story.project_id,
        data: story,
        actionBy: user.id,
        eventDetails: `Story deleted by ${user.email}`,
      });

      return await this.prismaService.story.delete({
        where: { id: id },
      });
    }
  }
  async updateTask(id: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.prismaService.task.findUnique({
      where: { id },
      include: { stories: true },
    });

    if (!task) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }

    const updatedTask = await this.prismaService.task.update({
      where: { id },
      data: {
        title: updateTaskDto.title,
        description: updateTaskDto.description,
        type: updateTaskDto.type,
        updated_at: new Date(),
      },
      include: {
        stories: {
          include: {
            assignee: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return mapToTaskDto(updatedTask);
  }

  async deleteTask(id: string) {
    const task = await this.prismaService.task.findUnique({
      where: { id },
      include: { stories: true },
    });

    if (!task) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }

    // Delete all stories associated with the task
    if (task.stories.length > 0) {
      await this.prismaService.story.deleteMany({
        where: { task_id: id },
      });
    }

    // Delete the task
    await this.prismaService.task.delete({
      where: { id },
    });

    return true;
  }
  async getTasksBySprintId(sprintId: string) {
    const tasks = await this.prismaService.task.findMany({
      where: { sprint_id: sprintId },
      orderBy: {
        order: 'asc',
      },
    });
    return tasks.map(mapToTaskDto);
  }

  async getBacklogTasks(projectId: string) {
    try {
      const tasks = await this.prismaService.task.findMany({
        where: {
          project_id: projectId,
          sprint_id: null,
        },
        include: {
          stories: {
            include: {
              assignee: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
        orderBy: {
          order: 'asc',
        },
      });
      return tasks.map(mapToTaskDto);
    } catch (error) {
      this.logger.error(`Failed to get backlog tasks: ${error.message}`);
      throw new HttpException(
        'Failed to get backlog tasks',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async moveTaskToBacklog(taskId: string) {
    try {
      const task = await this.prismaService.task.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
      }

      // Update task and its stories in a transaction
      const updatedTask = await this.prismaService.$transaction(
        async (prisma) => {
          // Update all stories under this task to remove sprint_id
          await prisma.story.updateMany({
            where: { task_id: taskId },
            data: { sprint_id: null },
          });

          // Update the task itself
          const task = await prisma.task.update({
            where: { id: taskId },
            data: {
              sprint_id: null,
              order: null,
              updated_at: new Date(),
            },
            include: {
              stories: {
                include: {
                  assignee: true,
                },
                orderBy: {
                  order: 'asc',
                },
              },
            },
          });

          return task;
        },
      );

      return mapToTaskDto(updatedTask);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to move task to backlog: ${error.message}`);
      throw new HttpException(
        'Failed to move task to backlog',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async moveTaskToSprint(taskId: string) {
    try {
      const task = await this.prismaService.task.findUnique({
        where: { id: taskId },
      });

      const sprint = await this.prismaService.sprints.findFirst({
        where: {
          project_id: task?.project_id,
        },
        orderBy: {
          sprint_number: 'desc',
        },
      });

      if (!task) {
        throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
      }

      if (!sprint) {
        throw new HttpException(
          'Sprint not found, please create a sprint first',
          HttpStatus.NOT_FOUND,
        );
      }

      // Update task and its stories in a transaction
      const updatedTask = await this.prismaService.$transaction(
        async (prisma) => {
          // Update all stories under this task to new sprint_id
          await prisma.story.updateMany({
            where: { task_id: taskId },
            data: { sprint_id: sprint.id },
          });

          // Update the task itself
          const task = await prisma.task.update({
            where: { id: taskId },
            data: {
              sprint_id: sprint.id,
              order: null,
              updated_at: new Date(),
            },
            include: {
              stories: {
                include: {
                  assignee: true,
                },
                orderBy: {
                  order: 'asc',
                },
              },
            },
          });

          return task;
        },
      );

      return mapToTaskDto(updatedTask);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to move task to sprint: ${error.message}`);
      throw new HttpException(
        'Failed to move task to sprint',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getTaskStatus(sprintId: string) {
    try {
      const sprint = await this.prismaService.sprints.findUnique({
        where: { id: sprintId },
        select: {
          task_status: true,
        },
      });
      if (sprint.task_status === 'Done') {
        const tasks = await this.prismaService.task.findMany({
          where: { sprint_id: sprintId },
          include: {
            stories: {
              include: {
                assignee: true,
                creator: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        });
        const stories = await this.prismaService.story.findMany({
          where: {
            sprint_id: sprintId,
            task_id: {
              isSet: false,
            },
          },
          include: {
            assignee: true,
            creator: true,
          },
        });
        const otherTask = {
          id: '',
          title: 'Other Tasks',
          description: 'Other Tasks',
          type: 'Feature',
          stories: stories.map(mapToUserStoriesDto),
        };
        return {
          type: 'success',
          data:
            stories.length > 0
              ? [...tasks.map(mapToTaskDto), otherTask]
              : tasks.map(mapToTaskDto),
        };
      } else {
        return {
          type: 'generating',
          data: [],
        };
      }
    } catch (error) {
      this.logger.error(`Failed to get task status: ${error.message}`);
      throw error;
    }
  }

  async getStoryStatus(taskId: string) {
    try {
      const task = await this.prismaService.task.findUnique({
        where: { id: taskId },
        include: {
          stories: {
            include: {
              assignee: true,
              creator: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
      });
      if (task.story_status === 'Done') {
        return {
          type: 'success',
          data: {
            stories: task.stories.map(mapToUserStoriesDto),
            research: task.research,
          },
        };
      } else {
        return {
          type: 'generating',
          data: [],
        };
      }
    } catch (error) {
      throw error;
    }
  }

  async getAcceptanceCriterionStatus(storyId: string) {
    try {
      const story = await this.prismaService.story.findUnique({
        where: { id: storyId },
        select: {
          acceptance_criteria: true,
          criterion_status: true,
        },
      });
      if (story.criterion_status === 'Done') {
        return {
          type: 'success',
          data: story.acceptance_criteria,
        };
      } else {
        return {
          type: 'generating',
          data: [],
        };
      }
    } catch (error) {
      throw error;
    }
  }

  async getPromptsStatus(storyId: string) {
    try {
      const story = await this.prismaService.story.findUnique({
        where: { id: storyId },
        select: {
          prompt_status: true,
          db_schema_prompt: true,
          api_prompt: true,
          ui_prompt: true,
        },
      });
      if (story.prompt_status === 'Done') {
        return {
          type: 'success',
          data: story,
        };
      } else {
        return {
          type: 'generating',
          data: story,
        };
      }
    } catch (error) {
      throw error;
    }
  }

  async reorderTasks(tasks: { taskId: string; order: number }[]) {
    try {
      // Use a transaction to ensure all updates happen atomically
      await this.prismaService.$transaction(async (prisma) => {
        for (const { taskId, order } of tasks) {
          await prisma.task.update({
            where: { id: taskId },
            data: { order },
          });
        }
      });
    } catch (error) {
      this.logger.error(`Failed to reorder tasks: ${error.message}`);
      throw new HttpException(
        'Failed to reorder tasks',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async reorderStories(stories: { storyId: string; order: number }[]) {
    try {
      await this.prismaService.$transaction(async (prisma) => {
        for (const { storyId, order } of stories) {
          await prisma.story.update({
            where: { id: storyId },
            data: { order },
          });
        }
      });
    } catch (error) {
      this.logger.error(`Failed to reorder stories: ${error.message}`);
      throw new HttpException(
        'Failed to reorder stories',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async moveStoryToTask(storyId: string, taskId: string) {
    const story = await this.prismaService.story.findUnique({
      where: { id: storyId },
    });
    if (!story) {
      throw new HttpException('Story not found', HttpStatus.NOT_FOUND);
    }
    const task = await this.prismaService.task.findUnique({
      where: { id: taskId },
    });
    if (!task) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }
    await this.prismaService.story.update({
      where: { id: storyId },
      data: {
        task_id: taskId,
      },
    });
    return true;
  }
}
