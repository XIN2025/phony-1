import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TasksService } from 'src/tasks/tasks.service';
import { TextExtractorService } from 'src/text-extractor/text-extractor.service';
import { getMeetingUserPrompt } from './prompts/meeting-summary.prompt';
import { ProjectSummaryService } from 'src/helper/project-summary.service';
import { UpdateSprintDto } from './dtos/sprint.dto';
import { Prisma, SprintStatus } from '@prisma/client';
import {
  SprintDashboardQueryDto,
  SprintDashboardResponseDto,
} from './dtos/sprint-dashboard.dto';
import {
  calculateCountryTotals,
  calculateExpandedWeeklyCountryTotals,
  calculateExpandedWeeklyTotalData,
  calculateTotalMonthlyData,
  generateAllWeeks,
  generateWeeksByMonth,
  getDateRange,
  getMonthsRange,
  processSprintDataWithExpandedWeeks,
} from './utils/sprint.utils';
import { generateObjectAI, getLLM } from 'src/common/utils/llm.util';
import { ModelType } from 'src/common/enums/ModelType.enum';
import { generateText } from 'ai';
import { prompts } from 'src/common/prompts';
import { z } from 'zod';

@Injectable()
export class ProjectSprintService {
  logger = new Logger(ProjectSprintService.name);

  constructor(
    private prismaService: PrismaService,
    private readonly tasksService: TasksService,
    private readonly textExtractorService: TextExtractorService,
    private readonly projectSummaryService: ProjectSummaryService,
  ) {}

  async deleteSprint(sprintId: string): Promise<void> {
    try {
      const sprint = await this.prismaService.sprints.findUnique({
        where: { id: sprintId },
        select: {
          sprint_number: true,
          project_id: true,
        },
      });
      if (!sprint) {
        throw new HttpException('Sprint not found', HttpStatus.NOT_FOUND);
      }
      await this.prismaService.$transaction([
        this.prismaService.task.deleteMany({
          where: { sprint_id: sprintId },
        }),
        this.prismaService.story.deleteMany({
          where: { sprint_id: sprintId },
        }),
        this.prismaService.sprints.updateMany({
          where: {
            project_id: sprint.project_id,
            sprint_number: { gt: sprint.sprint_number },
          },
          data: { sprint_number: { decrement: 1 } },
        }),
        this.prismaService.sprints.delete({
          where: { id: sprintId },
        }),
      ]);
      this.logger.log(`Sprint ${sprintId} deleted successfully`);
    } catch (error) {
      this.logger.error(`Failed to delete sprint: ${error.message}`);
      throw new HttpException(
        `Failed to delete sprint`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async formatRequirements(requirements: string) {
    const prompt = `You are a professional requirements engineer. Given the following raw requirement text that is generated in a hurry and is not well-formatted, please provide a concise and formatted version of the requirements: 
    Raw Requirements:
    ${requirements}`;
    this.logger.log('formatting requirements');
    const llm = getLLM(ModelType.GPT_4O_MINI);
    const res = await generateText({
      model: llm,
      prompt: prompt,
    });
    return res.text;
  }

  /**
   * Extracts meaningful product-related information from meeting transcripts
   * @param meetingText Raw meeting transcript text
   * @returns Formatted summary of product-related information
   */
  async extractMeetingSummary(
    meetingText: string,
    initial: boolean = false,
  ): Promise<string> {
    try {
      this.logger.log('Starting meeting summary extraction');

      const systemPrompt = prompts.getMeetingSummaryPrompt();

      const response = await generateObjectAI({
        model: ModelType.GEMINI_2_0_FLASH,
        system: systemPrompt,
        prompt: getMeetingUserPrompt(meetingText, initial),
        schema: z.object({
          title: z.string(),
          summary: z.string(),
        }),
      });
      this.logger.log('Meeting summary extraction completed');

      return response.summary || 'No summary found';
    } catch (error) {
      this.logger.error(`Failed to extract meeting summary: ${error.message}`);
      throw new HttpException(
        'Failed to extract meeting summary',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async extractDocumentType(file: string) {
    try {
      const prompt = `I have a starting 300 characters of a document text, I want to know what type of document it is. It can be meeting transcript or a simple requirements document. you should return the type of document in a single word.
    Output should be "meeting" or "requirements", a single word.
    Document Text:
    ${file.slice(0, 300)}`;
      const documentType = await generateObjectAI({
        model: ModelType.GPT_4O_MINI,
        prompt: prompt,
        schema: z.object({
          documentType: z.enum(['meeting', 'requirements']),
        }),
      });
      return documentType.documentType || 'meeting';
    } catch (error) {
      this.logger.error(`Failed to extract document type: ${error.message}`);
      return 'meeting';
    }
  }
  async extractTextAndSummarize(
    file: Express.Multer.File,
    initial: boolean = false,
  ) {
    const fileType = file.originalname.split('.').pop() as
      | 'docx'
      | 'txt'
      | 'pdf';
    const extractedText = await this.textExtractorService.extractText(
      file.buffer,
      fileType,
    );
    const extractDocumentType = await this.extractDocumentType(extractedText);
    this.logger.log(extractDocumentType);
    if (extractDocumentType === 'requirements') {
      const formattedRequirements =
        await this.formatRequirements(extractedText);
      return formattedRequirements;
    } else {
      const meetingSummary = await this.extractMeetingSummary(
        extractedText,
        initial,
      );
      return meetingSummary;
    }
  }

  async createSprint(
    projectId: string,
    title: string,
    shiftData: boolean,
    requirements?: string,
    startDate?: Date,
    endDate?: Date,
    file?: Express.Multer.File,
  ) {
    try {
      let requirementText = requirements || '';

      if (file) {
        const meetingSummary = await this.extractTextAndSummarize(file);
        requirementText = requirementText
          ? `Direct Requirements:\n${requirementText}\n\n${meetingSummary}`
          : meetingSummary;
      }

      const lastSprint = await this.prismaService.sprints.findFirst({
        where: { project_id: projectId },
        orderBy: { sprint_number: 'desc' },
      });

      const sprint = await this.prismaService.sprints.create({
        data: {
          project_id: projectId,
          name: title,
          requirements: requirementText,
          start_date: startDate || new Date(),
          sprint_number: (lastSprint?.sprint_number ?? 0) + 1,
          end_date: endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });

      // Move tasks and stories from previous sprint to new sprint
      if (lastSprint && shiftData) {
        await this.moveTasksAndStories(lastSprint.id, sprint.id);
      }

      if (requirementText) {
        this.tasksService.generateTasks(
          {
            projectId: projectId,
            sprintId: sprint.id,
          },
          true,
        );
      }

      return sprint;
    } catch (error) {
      this.logger.error(`Failed to create sprint: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to create sprint`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async fetchSprintsData(
    userEmail: string,
    query: SprintDashboardQueryDto,
  ) {
    const range = getDateRange(query);
    let startDate = range.startDate;
    const endDate = range.endDate;

    const where: Prisma.sprintsWhereInput = {
      projects: {
        OR: [
          {
            project_type: null,
          },
          {
            project_type: { isSet: false },
          },
          {
            NOT: {
              project_type: 'INTERNAL',
            },
          },
        ],
        project_members: {
          some: {
            user_email: userEmail,
          },
        },
      },
    };

    if (query.range !== 'all') {
      where.OR = [
        {
          start_date: {
            lte: endDate,
          },
          end_date: {
            gte: startDate,
          },
        },
      ];
    }

    const sprints = await this.prismaService.sprints.findMany({
      where,
      orderBy: {
        start_date: 'asc',
      },
      include: {
        projects: {
          select: {
            id: true,
            title: true,
            country_origin: true,
          },
        },
      },
    });

    if (sprints.length > 0 && query.range !== 'default') {
      startDate = sprints[0].start_date;
    }
    return { sprints, startDate, endDate };
  }

  // Main method
  async getSprintDashboardData(
    userEmail: string,
    query: SprintDashboardQueryDto,
  ): Promise<SprintDashboardResponseDto> {
    const sprintsData = await this.fetchSprintsData(userEmail, query);

    // Generate months list for the range
    const monthsList = getMonthsRange(
      sprintsData.startDate,
      sprintsData.endDate,
    );

    // Generate consistent 4 weeks for all months
    const weeksList = generateAllWeeks();
    const weeksByMonth = generateWeeksByMonth(monthsList);

    // Create expanded weeks list with month prefixes
    const expandedWeeksList: string[] = [];
    monthsList.forEach((month) => {
      weeksList.forEach((week) => {
        expandedWeeksList.push(`${month} ${week}`);
      });
    });

    // Process sprint data for both monthly and weekly views with expanded weeks
    const { countryData, weeklyCountryData } =
      processSprintDataWithExpandedWeeks(
        sprintsData,
        monthsList,
        expandedWeeksList,
      );

    // Calculate totals
    const monthlyTotalData = calculateTotalMonthlyData(monthsList, countryData);
    const weeklyTotalData = calculateExpandedWeeklyTotalData(
      expandedWeeksList,
      weeklyCountryData,
    );

    // Calculate country totals
    const countryTotals = calculateCountryTotals(countryData, monthsList);
    const weeklyCountryTotals = calculateExpandedWeeklyCountryTotals(
      weeklyCountryData,
      expandedWeeksList,
    );

    return {
      monthsList,
      weeksByMonth,
      weeksList: expandedWeeksList,
      data: countryData,
      weeklyData: weeklyCountryData,
      monthlyTotalData,
      weeklyTotalData,
      countryTotals,
      weeklyCountryTotals,
    };
  }

  async getUserSprints(userEmail: string) {
    try {
      const sprints = await this.prismaService.sprints.findMany({
        where: {
          projects: {
            project_members: {
              some: {
                user_email: userEmail,
              },
            },
          },
        },
        include: {
          projects: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      return sprints;
    } catch (error) {
      this.logger.error(`Failed to fetch user sprints: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to fetch user sprints`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateSprint(sprintId: string, sprint: UpdateSprintDto) {
    try {
      const startDate = new Date(sprint.startDate);
      const endDate = new Date(sprint.endDate);
      if (startDate > endDate) {
        throw new HttpException(
          'End date must be after start date',
          HttpStatus.BAD_REQUEST,
        );
      }
      const oldSprint = await this.prismaService.sprints.findUnique({
        where: { id: sprintId },
      });
      const updatedSprint = await this.prismaService.sprints.update({
        where: { id: sprintId },
        data: {
          end_date: sprint.endDate ?? undefined,
          start_date: sprint.startDate ?? undefined,
          name: sprint.name ?? undefined,
          price: sprint.price ?? undefined,
          requirements: sprint.requirements ?? undefined,
          status: sprint.status ?? undefined,
        },
        include: {
          projects: true,
        },
      });
      if (
        oldSprint.status === SprintStatus.NotStarted &&
        updatedSprint.status === SprintStatus.Active
      ) {
        this.projectSummaryService.sendSprintRoadmap(updatedSprint.id);
      }
      return updatedSprint;
    } catch (error) {
      this.logger.error(`Failed to update sprint: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to update sprint`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async moveTasksAndStories(lastSprint: string, sprint: string) {
    this.logger.log('Moving tasks and stories');

    // Get tasks from last sprint
    const tasksWithStories = await this.prismaService.task.findMany({
      where: { sprint_id: lastSprint },
      include: { stories: true },
    });

    await this.prismaService.$transaction(async (tx) => {
      for (const task of tasksWithStories) {
        const notDoneStories = task.stories.filter(
          (story) => story.status !== 'Done',
        );
        const allStoriesInTodo = task.stories.every(
          (story) => story.status === 'Todo',
        );
        if (allStoriesInTodo) {
          // Move entire task if all stories are in Todo
          await tx.task.update({
            where: { id: task.id },
            data: { sprint_id: sprint },
          });
          await tx.story.updateMany({
            where: { task_id: task.id },
            data: { sprint_id: sprint },
          });
        } else if (notDoneStories.length > 0) {
          // Create new task and move only not done stories
          const newTask = await tx.task.create({
            data: {
              title: task.title,
              description: task.description,
              type: task.type,
              sprint_id: sprint,
              project_id: task.project_id,
            },
          });

          await tx.story.updateMany({
            where: {
              id: { in: notDoneStories.map((s) => s.id) },
            },
            data: {
              sprint_id: sprint,
              task_id: newTask.id,
            },
          });
        }
      }
    });
  }
}
