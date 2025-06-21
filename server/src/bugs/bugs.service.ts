import {
  ForbiddenException,
  HttpException,
  NotFoundException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PrerecordedSchema } from '@deepgram/sdk';
import { S3Service } from 'src/utils/s3.service';
import { DeepgramService } from 'src/utils/deepgram.service';
import { ModelType } from 'src/common/enums/ModelType.enum';
import { bug_comments, BugStatus, users } from '@prisma/client';
import { GetBugsByProjectQueryDto, UpdateBugDto } from './dtos/bug.dto';
import { prompts } from 'src/common/prompts';
import { generateId, Message } from 'ai';
import { generateObjectAI } from 'src/common/utils/llm.util';
import { z } from 'zod';
import {
  BugCommentResponse,
  BugUpdateCommentDto,
} from './dtos/bug-comment.dto';
import { BugCreateCommentDto } from './dtos/bug-comment.dto';
import { emailTemplateWrapper } from 'src/mail/templates/wrapper';
import { MENTION_NOTIFICATION_TEMPLATE } from 'src/mail/templates/mention-notification';
import { BUG_NOTIFICATION_TEMPLATE } from 'src/mail/templates/bug-notification';
import { COMMENT_NOTIFICATION_TEMPLATE } from 'src/mail/templates/comment-notification';
import { MailService } from 'src/mail/mail.service';
@Injectable()
export class BugsService {
  private readonly logger = new Logger(BugsService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
    private readonly deepgramService: DeepgramService,
    private readonly mailService: MailService,
  ) {}

  async processFeedbackAndGetInformation({
    images,
    text,
    transcription,
  }: {
    images?: Express.Multer.File[];
    text?: string;
    transcription?: string;
  }) {
    try {
      this.logger.log('Processing feedback...');
      const prompt = prompts.getBugPrompt();
      const message: Message = {
        content: '',
        role: 'user',
        experimental_attachments: images
          ? images.map((image) => ({
              name: image.originalname,
              contentType: image.mimetype,
              url: `data:${image.mimetype};base64,${image.buffer.toString('base64')}`,
            }))
          : [],
        id: generateId(),
        parts: [],
      };
      if (text) {
        message.content = text;
        message.parts.push({
          type: 'text',
          text: `Text Feedback:\n${text}`,
        });
      }
      if (transcription) {
        message.parts.push({
          type: 'text',
          text: `Voice Transcription:\n${transcription}`,
        });
      }

      const response = await generateObjectAI({
        model: ModelType.GEMINI_2_0_FLASH,
        system: prompt,
        messages: [message],
        schema: z.object({
          title: z.string(),
          summary: z.string(),
        }),
      });
      this.logger.log('Response generated, creating feedback...');
      return response;
    } catch (error) {
      console.error('Error generating feedback', error);
      throw new HttpException(error.message, 500);
    }
  }

  async createBug(
    userId: string,
    files: {
      screenshots?: Express.Multer.File[];
      voiceFeedback?: Express.Multer.File[];
    },
    projectId: string,
    textFeedback?: string,
  ) {
    const MAX_SIZE = 1024 * 1024 * 5;
    const screenshotFiles = files.screenshots ?? [];
    const voiceFeedbackFile = files.voiceFeedback
      ? files.voiceFeedback[0]
      : null;

    let transcription: string | undefined;

    if (screenshotFiles && screenshotFiles.length > 0) {
      for (const screenshot of screenshotFiles) {
        if (screenshot.size > MAX_SIZE) {
          throw new HttpException('Screenshot is too large', 400);
        }
      }
    }

    if (voiceFeedbackFile && voiceFeedbackFile.size > MAX_SIZE) {
      throw new HttpException('Voice feedback is too large', 400);
    }

    const transcriptionOptions: PrerecordedSchema = {
      model: 'nova-3',
      detect_entities: true,
      smart_format: true,
      diarize: true,
    };
    if (voiceFeedbackFile) {
      transcription = await this.deepgramService.transcribeWithRetry(
        voiceFeedbackFile.buffer,
        transcriptionOptions,
      );
    }

    const extractedInformation = await this.processFeedbackAndGetInformation({
      images:
        screenshotFiles && screenshotFiles.length > 0
          ? screenshotFiles
          : undefined,
      text: textFeedback ?? undefined,
      transcription: transcription ?? undefined,
    });

    const [screenshotUrls, voiceFeedbackUrls] = await Promise.all([
      this.uploadFiles(screenshotFiles),
      voiceFeedbackFile
        ? this.uploadFiles([voiceFeedbackFile])
        : Promise.resolve([]),
    ]);

    if (extractedInformation.title === '') {
      throw new HttpException('No feedback found', 400);
    }

    const feedback = await this.prisma.project_bugs.create({
      data: {
        textFeedback: textFeedback,
        screenshots: screenshotUrls,
        voiceFeedbackUrl: voiceFeedbackUrls[0],
        summary: extractedInformation?.summary,
        title: extractedInformation?.title,
        voiceFeedbackTranscription: transcription,
        projectId: projectId,
        createdBy: userId,
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            unique_name: true,
          },
        },
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });

    // Send notifications to team members
    await this.sendBugNotifications(feedback);

    return feedback;
  }

  public async getBugsByProject(
    projectId: string,
    options: GetBugsByProjectQueryDto,
  ) {
    const { page = 1, limit = 10, status } = options;
    const skip = (page - 1) * limit;

    const where = {
      projectId,
      ...(status && { status }),
    };

    const [bugs, total] = await Promise.all([
      this.prisma.project_bugs.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          creator: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              avatar_url: true,
            },
          },
          assignee: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              avatar_url: true,
            },
          },
        },
        skip,
        take: limit,
      }),
      this.prisma.project_bugs.count({ where }),
    ]);

    return {
      bugs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async convertBugToTask(id: string) {
    const bug = await this.prisma.project_bugs.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!bug) {
      throw new HttpException('Bug not found', 404);
    }

    const sprint = await this.prisma.sprints.findFirst({
      where: {
        project_id: bug.projectId,
      },
      orderBy: {
        sprint_number: 'desc',
      },
    });
    // Start a transaction to ensure data consistency
    return await this.prisma.$transaction(async (tx) => {
      // Create a new task from the bug
      const task = await tx.task.create({
        data: {
          title: bug.title || 'Bug Fix Required',
          description: `${bug.summary || ''}\n\nOriginal Bug Report:\n${
            bug.textFeedback || ''
          }${
            bug.voiceFeedbackTranscription
              ? `\n\nVoice Feedback: ${bug.voiceFeedbackTranscription}`
              : ''
          }${
            bug.screenshots && bug.screenshots.length > 0
              ? `\n\nScreenshots: ${bug.screenshots.join('\n')}`
              : ''
          }`,
          type: 'Bug',
          project_id: bug.projectId,
          sprint_id: sprint?.id,
        },
      });

      // Update the bug status to closed
      await tx.project_bugs.delete({
        where: { id },
      });

      return task;
    });
  }

  public async updateBug(bugId: string, dto: UpdateBugDto) {
    const bug = await this.prisma.project_bugs.findUnique({
      where: { id: bugId },
    });

    if (!bug) {
      throw new NotFoundException('Bug not found');
    }

    return this.prisma.project_bugs.update({
      where: { id: bugId },
      data: {
        title: dto.title,
        textFeedback: dto.textFeedback,
      },
      include: {
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            avatar_url: true,
          },
        },
        assignee: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            avatar_url: true,
          },
        },
      },
    });
  }

  public async updateBugStatus(id: string, status: BugStatus) {
    await this.prisma.project_bugs.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
    return true;
  }

  public async updateBugAssignee(id: string, assigneeId: string | null) {
    return this.prisma.project_bugs.update({
      where: {
        id,
      },
      data: {
        assigneeId, // When null is passed, it will unassign the bug
      },
      include: {
        assignee: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            avatar_url: true,
          },
        },
      },
    });
  }

  public async deleteBug(id: string) {
    await this.prisma.project_bugs.delete({
      where: {
        id,
      },
    });
    return true;
  }
  private async uploadFiles(files: Express.Multer.File[]) {
    const urls: string[] = [];
    for (const file of files) {
      const result = await this.s3Service.uploadFile(
        file,
        `bugs/${new Date().getTime()}-${file.originalname}`,
      );
      urls.push(result.url);
    }
    return urls;
  }

  private async sendBugNotifications(bug: any) {
    try {
      // Fetch project members with Developer, Manager, and Admin roles
      const projectMembers = await this.prisma.project_members.findMany({
        where: {
          project_id: bug.projectId,
          role: {
            in: ['Developer', 'Manager', 'Admin'],
          },
        },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
            },
          },
        },
      });

      // Filter out the user who created the bug and users without email
      const recipientMembers = projectMembers.filter(
        (member) =>
          member.users &&
          member.users.email &&
          member.users.id !== bug.createdBy,
      );

      if (recipientMembers.length === 0) {
        this.logger.log('No eligible recipients for bug notification');
        return;
      }

      // Prepare email context
      const emailContext = {
        title: bug.title || 'New Bug Report',
        summary: bug.summary || 'No summary provided',
        projectName: bug.project.title,
        reporterName: `${bug.creator.first_name} ${bug.creator.last_name}`,
        reportedDate: new Date(bug.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        textFeedback: bug.textFeedback || 'No additional details provided',
        bugLink: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/project/${bug.project.unique_name}/bugs?bugId=${bug.id}`,
      };

      // Send emails to all eligible recipients
      for (const member of recipientMembers) {
        if (member.users?.email) {
          await this.mailService.sendTemplateMail({
            to: member.users.email,
            subject: `🐛 New Bug Report: ${bug.title || 'Untitled Bug'}`,
            template: emailTemplateWrapper(BUG_NOTIFICATION_TEMPLATE),
            context: emailContext,
          });
        }
      }

      this.logger.log(
        `Bug notification sent to ${recipientMembers.length} team members`,
      );
    } catch (error) {
      this.logger.error('Failed to send bug notifications:', error);
      // Don't throw error to avoid breaking bug creation process
    }
  }

  private extractMentions(content: string): Array<{
    userId: string;
    display: string;
  }> {
    const mentions = [];
    const regex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
      if (!match) break;
      mentions.push({
        userId: match[2],
        display: match[1],
      });
    }

    return mentions;
  }

  private mapToCommentResponse(
    comment: bug_comments & {
      user: users;
      replies?: (bug_comments & { user: users })[];
    },
  ): BugCommentResponse {
    return {
      id: comment.id,
      content: comment.content,
      userId: comment.user_id,
      user: {
        firstName: comment.user.first_name,
        lastName: comment.user.last_name,
        avatarUrl: comment.user.avatar_url,
      },
      bugId: comment.bug_id,
      parentId: comment.parent_id,
      isEdited: comment.is_edited,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      replies: comment.replies?.map((reply) =>
        this.mapToCommentResponse(reply),
      ),
    };
  }

  async createComment(
    userId: string,
    dto: BugCreateCommentDto,
  ): Promise<BugCommentResponse> {
    // Get bug with project and creator details
    const bug = await this.prisma.project_bugs.findUnique({
      where: { id: dto.bugId },
      include: {
        project: {
          select: {
            id: true,
            unique_name: true,
            title: true,
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    if (!bug) {
      throw new NotFoundException('Bug not found');
    }

    // Extract mentions before creating comment
    const mentions = this.extractMentions(dto.content);

    if (dto.parentId) {
      const parentComment = await this.prisma.bug_comments.findUnique({
        where: { id: dto.parentId },
      });

      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }

      if (parentComment.parent_id) {
        throw new ForbiddenException('Cannot reply to a reply');
      }
    }

    // Get project members to validate mentions
    const projectMembers = await this.prisma.project_members.findMany({
      where: {
        project_id: bug.projectId,
      },
      include: {
        users: true,
      },
    });

    // Create the comment
    const comment = await this.prisma.bug_comments.create({
      data: {
        content: dto.content,
        bug_id: bug.id,
        user_id: userId,
        parent_id: dto.parentId,
      },
      include: {
        user: true,
        replies: {
          include: {
            user: true,
          },
        },
      },
    });

    // Get commenter's name for the notification
    const commenter = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    const sanitizedContent = dto.content.replace(
      /@\[([^\]]+)\]\(([^)]+)\)/g,
      '<span style="text-decoration: underline; color: #3b82f6;">$1</span>',
    );

    // Send notifications to mentioned users who are project members
    let validMentions: {
      userId: string;
      display: string;
    }[] = [];
    if (mentions.length > 0) {
      validMentions = mentions
        .filter((mention) =>
          projectMembers.some((member) => member.users?.id === mention.userId),
        )
        .filter(
          (mention, index, self) =>
            index === self.findIndex((m) => m.userId === mention.userId),
        );

      for (const mention of validMentions) {
        const mentionedUser = projectMembers.find(
          (member) => member.users?.id === mention.userId,
        )?.users;

        if (mentionedUser && mentionedUser.email) {
          this.mailService.sendTemplateMail({
            to: mentionedUser.email,
            subject: 'You were mentioned in a comment',
            template: emailTemplateWrapper(MENTION_NOTIFICATION_TEMPLATE),
            context: {
              mentionerName: `${commenter?.first_name} ${commenter?.last_name}`,
              title: bug.title,
              type: 'Bug',
              link: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/project/${bug.project.unique_name}/bugs?bugId=${bug.id}`,
              content: sanitizedContent,
            },
          });
        }
      }
    }

    // Send notification to bug creator if the commenter is not the creator
    if (
      bug.creator &&
      bug.creator.email &&
      !validMentions
        .map((mention) => mention.userId)
        .includes(bug.creator.id) &&
      bug.creator.id !== userId
    ) {
      this.mailService.sendTemplateMail({
        to: bug.creator.email,
        subject: `💬 New comment on your bug: ${bug.title}`,
        template: emailTemplateWrapper(COMMENT_NOTIFICATION_TEMPLATE),
        context: {
          commenterName: `${commenter?.first_name} ${commenter?.last_name}`,
          title: bug.title,
          type: 'bug',
          link: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/project/${bug.project.unique_name}/bugs?bugId=${bug.id}`,
          content: sanitizedContent,
        },
      });
    }

    return this.mapToCommentResponse(comment);
  }

  async getComments(bugId: string): Promise<BugCommentResponse[]> {
    const comments = await this.prisma.bug_comments.findMany({
      where: {
        bug_id: bugId,
        parent_id: {
          isSet: false,
        },
      },
      include: {
        user: true,
        replies: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
    return comments.map((comment) => this.mapToCommentResponse(comment));
  }

  async updateComment(
    userId: string,
    commentId: string,
    dto: BugUpdateCommentDto,
  ): Promise<BugCommentResponse> {
    const comment = await this.prisma.bug_comments.findUnique({
      where: { id: commentId },
      include: { user: true },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.user_id !== userId) {
      throw new ForbiddenException(
        'Cannot update comment created by another user',
      );
    }

    const updatedComment = await this.prisma.bug_comments.update({
      where: { id: commentId },
      data: {
        content: dto.content,
        is_edited: true,
      },
      include: {
        user: true,
        replies: {
          include: {
            user: true,
          },
        },
      },
    });

    return this.mapToCommentResponse(updatedComment);
  }

  async deleteComment(userId: string, commentId: string): Promise<boolean> {
    const comment = await this.prisma.wiki_comments.findUnique({
      where: { id: commentId },
      include: { user: true },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.user_id !== userId) {
      throw new ForbiddenException(
        'Cannot delete comment created by another user',
      );
    }

    await this.prisma.wiki_comments.delete({
      where: { id: commentId },
    });

    return true;
  }
}
