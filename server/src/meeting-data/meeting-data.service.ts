import { HttpException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FeatureType, meeting_data } from '@prisma/client';
import { CreateMeetingDataDto } from './dtos/meeting-data.dto';
import { GenerateUserStoriesDto } from './dtos/user-stories.dto';
import { TextExtractorService } from 'src/text-extractor/text-extractor.service';
import { HelperService } from 'src/helper/helper.service';
import { getModelType } from 'src/common/utils/utils.util';
import { ModelType } from 'src/common/enums/ModelType.enum';
import { RagService } from 'src/rag/rag.service';
import { generateText } from 'ai';
import { z } from 'zod';
import { prompts } from 'src/common/prompts';
import { generateObjectAI, getLLM } from 'src/common/utils/llm.util';

@Injectable()
export class MeetingDataService {
  private readonly logger = new Logger(MeetingDataService.name);
  constructor(
    private prisma: PrismaService,
    private readonly textExtractorService: TextExtractorService,
    private readonly helperService: HelperService,
    private readonly ragService: RagService,
  ) {}

  async create(body: CreateMeetingDataDto): Promise<meeting_data> {
    const { projectId, resourceId, metadata, transcript, createdBy } = body;

    // Filter transcript
    this.logger.debug('Filtering transcript');
    const filteredTranscript = await this.getFilteredTranscript(transcript);

    // Generate summary
    const { summary, title } =
      await this.generateSummaryAndTitleFromTranscript(filteredTranscript);

    // Create meeting data
    this.logger.debug('Creating meeting data');
    const meeting = await this.prisma.meeting_data.create({
      data: {
        project_id: projectId || null,
        resource_id: resourceId || null,
        createdBy: createdBy,
        metadata: metadata,
        summary: summary,
        title: title,
        transcript,
        filtered_transcript: filteredTranscript,
      },
    });
    this.ragService.embedAndStoreMeeting(meeting);
    return meeting;
  }

  async generateSummaryAndTitleFromTranscript(transcript: string) {
    try {
      const res = await generateObjectAI({
        model: ModelType.GEMINI_2_0_FLASH,
        system: prompts.getMeetingSummaryPrompt(),
        prompt: `Transcript: \n${transcript}`,
        schema: z.object({
          summary: z.string(),
          title: z
            .string()
            .describe('Short title for the meeting, max 3 words'),
        }),
      });
      this.logger.log(`Generating summary...`);

      return res;
    } catch (error) {
      this.logger.warn(`Error Generating Summary : ${error?.message}`);
      return {
        summary: 'Summary Not Generated!',
        title: 'Meeting MOM',
      };
    }
  }

  async update(id: string, data: Partial<meeting_data>): Promise<meeting_data> {
    return this.prisma.meeting_data.update({
      where: { id },
      data: {
        title: data.title ?? undefined,
        summary: data.summary ?? undefined,
        transcript: data.transcript ?? undefined,
        metadata: data.metadata ?? undefined,
        updated_at: new Date(),
      },
    });
  }

  async remove(id: string): Promise<meeting_data> {
    return this.prisma.meeting_data.delete({
      where: { id },
    });
  }

  async findGlobalMeetings(userId: string): Promise<meeting_data[]> {
    return this.prisma.meeting_data.findMany({
      where: {
        project_id: null,
        createdBy: userId,
      },
      orderBy: {
        created_at: 'desc',
      },
      include: {
        resources: true,
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            avatar_url: true,
          },
        },
      },
    });
  }

  async moveToProject(
    meetingId: string,
    projectId: string,
  ): Promise<meeting_data> {
    try {
      const tasks = await this.prisma.task.findMany({
        where: {
          meeting_id: meetingId,
        },
      });

      if (tasks.length > 0) {
        throw new HttpException(
          'Cannot move meeting - requirements have already been generated from this meeting.',
          400,
        );
      }
      return this.prisma.meeting_data.update({
        where: { id: meetingId },
        data: { project_id: projectId },
      });
    } catch (error) {
      this.logger.error(`Failed to move meeting to project: ${error.message}`);
      throw new HttpException('Failed to move meeting to project', 500);
    }
  }

  async findByProjectId(projectId: string): Promise<meeting_data[]> {
    return this.prisma.meeting_data.findMany({
      where: { project_id: projectId },
      orderBy: {
        created_at: 'desc',
      },
      include: {
        resources: true,
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            avatar_url: true,
          },
        },
      },
    });
  }

  async generateUserStories(
    body: GenerateUserStoriesDto,
    file?: Express.Multer.File,
  ) {
    let requirement = body.storyInput;
    if (file) {
      const fileType = file.originalname.split('.').pop() as
        | 'docx'
        | 'txt'
        | 'pdf';
      const text = await this.textExtractorService.extractText(
        file.buffer,
        fileType,
      );
      requirement = `${requirement}\n\n${text}`;
    }
    const meeting = await this.prisma.meeting_data.findUnique({
      where: {
        id: body.meetingId,
      },
    });

    if (!meeting.project_id) {
      throw new HttpException('Project not found', 404);
    }
    if (meeting.project_id !== body.projectId) {
      throw new HttpException('Project not found', 404);
    }

    if (body.sprintOption === 'current') {
      const sprint = await this.prisma.sprints.findFirst({
        where: {
          project_id: body.projectId,
        },
        orderBy: {
          sprint_number: 'desc',
        },
      });
      if (sprint) {
        await this.helperService.updateTaskStatus(sprint.id, 'Generating');
        await this.generateAndSaveTasksFromSummary(
          meeting.filtered_transcript ?? meeting.summary,
          requirement,
          body.projectId,
          sprint.id,
          body.meetingId,
        );
        await this.helperService.updateTaskStatus(sprint.id, 'Done');
      } else {
        this.logger.log('No sprint found');
        throw new HttpException(
          'No sprint found, please create a sprint first',
          400,
        );
      }
    } else if (body.sprintOption === 'backlog') {
      await this.generateAndSaveTasksFromSummary(
        meeting.filtered_transcript ?? meeting.summary,
        requirement,
        body.projectId,
        null,
        body.meetingId,
      );
    }
    await this.prisma.meeting_data.update({
      where: {
        id: body.meetingId,
      },
      data: {
        isStoriesCreated: true,
      },
    });
  }

  async generateAndSaveTasksFromSummary(
    summary: string,
    requirement: string,
    projectId: string,
    sprintId: string | null,
    meetingId: string,
  ) {
    try {
      const project = await this.prisma.projects.findUnique({
        where: {
          id: projectId,
        },
        select: {
          model_type: true,
        },
      });
      const modelType = getModelType(project.model_type);
      const res = await generateObjectAI({
        model: modelType,
        system: prompts.getTasksFromSummaryPrompt(),
        prompt: `Transcript/Summary: \n${summary}\n\nRequirement: \n${requirement}`,
        schema: z.object({
          tasks: z.array(
            z.object({
              title: z.string(),
              description: z.string(),
              type: z.string(),
              subTasks: z.array(
                z.object({
                  title: z.string(),
                  description: z.string(),
                  estimation: z.number(),
                  priority: z.number(),
                  acceptance_criteria: z.array(z.string()),
                }),
              ),
            }),
          ),
        }),
        maxRetries: 3,
      });

      const tasks = res.tasks;
      if (tasks?.length > 0) {
        await Promise.all(
          tasks.map(async (task) => {
            const createdTask = await this.prisma.task.create({
              data: {
                title: task.title,
                description: task.description,
                type: task.type as FeatureType,
                project_id: projectId,
                sprint_id: sprintId,
                meeting_id: meetingId,
              },
            });
            await Promise.all(
              task.subTasks.map(async (subTask) => {
                await this.prisma.story.create({
                  data: {
                    title: subTask.title,
                    description: subTask.description,
                    estimation: subTask.estimation,
                    priority: subTask.priority,
                    acceptance_criteria: subTask.acceptance_criteria?.map(
                      (criteria) => ({
                        criteria: criteria,
                        isCompleted: false,
                      }),
                    ),
                    sprint_id: sprintId,
                    project_id: projectId,
                    task_id: createdTask.id,
                  },
                });
              }),
            );
          }),
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to generate tasks from summary: ${error.message}`,
      );
      throw new HttpException('Failed to generate tasks from summary', 500);
    }
  }

  async getFilteredTranscript(transcript: string) {
    try {
      const res = await generateText({
        model: getLLM(ModelType.GEMINI_2_0_FLASH),
        system: prompts.getFilteredTranscriptPrompt(),
        prompt: `Transcript: \n${transcript}`,
      });
      return res.text;
    } catch (error) {
      this.logger.error(`Failed to sentence tagging: ${error.message}`);
      return transcript;
    }
  }
}
