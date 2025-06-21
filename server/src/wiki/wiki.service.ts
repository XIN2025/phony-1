import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  FeatureType,
  users,
  wiki_comments,
  WikiAccessLevel,
} from '@prisma/client';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { WikiCommentResponse } from './dto/types/comment.types';
import {
  WikiCreateCommentDto,
  WikiGenerateSprintDto,
  WikiGenerateType,
} from './dto/create-comment.dto';
import { MENTION_NOTIFICATION_TEMPLATE } from 'src/mail/templates/mention-notification';
import { emailTemplateWrapper } from 'src/mail/templates/wrapper';
import { WikiUpdateCommentDto } from './dto/update-comment.dto';
import { prompts } from 'src/common/prompts';
import { generateObjectAI } from 'src/common/utils/llm.util';
import { z } from 'zod';
import { ModelType } from 'src/common/enums/ModelType.enum';

@Injectable()
export class WikiService {
  constructor(
    private readonly prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(data: {
    unique_name: string;
    created_by: string;
    parentId?: string;
  }) {
    const project = await this.prisma.projects.findUnique({
      where: { unique_name: data.unique_name },
    });

    if (!project) {
      throw new NotFoundException(`Project not found`);
    }
    if (data.parentId) {
      const parentWiki = await this.prisma.project_wiki.findUnique({
        where: { id: data.parentId },
      });

      if (!parentWiki) {
        throw new NotFoundException(`Parent wiki not found`);
      }
      if (parentWiki.parent_id) {
        throw new ForbiddenException('Cannot create a sub-wiki for a sub-wiki');
      }
    }

    return this.prisma.project_wiki.create({
      data: {
        project_id: project.id,
        created_by: data.created_by,
        content: {},
        title: '',
        parent_id: data.parentId || null,
      },
      include: {
        creator: {
          select: {
            first_name: true,
            last_name: true,
            avatar_url: true,
          },
        },
      },
    });
  }

  async findByProjectName(unique_name: string) {
    const project = await this.prisma.projects.findUnique({
      where: { unique_name },
    });

    if (!project) {
      throw new NotFoundException(`Project not found`);
    }
    return this.prisma.project_wiki.findMany({
      where: {
        project_id: project.id,
        OR: [{ parent_id: null }, { parent_id: { isSet: false } }],
      },
      select: {
        id: true,
        title: true,
        created_at: true,
        updated_at: true,
        created_by: true,
        parent_id: true,
        creator: {
          select: {
            first_name: true,
            last_name: true,
            avatar_url: true,
          },
        },
        children: {
          select: {
            id: true,
            title: true,
            created_at: true,
            parent_id: true,
            updated_at: true,
            created_by: true,
            creator: {
              select: {
                first_name: true,
                last_name: true,
                avatar_url: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findById(id: string) {
    const wiki = await this.prisma.project_wiki.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            first_name: true,
            last_name: true,
            avatar_url: true,
          },
        },
      },
    });

    if (!wiki) {
      throw new NotFoundException(`Wiki with ID ${id} not found`);
    }

    return wiki;
  }

  async updateById(id: string, data: { title?: string; content?: any }) {
    const wiki = await this.prisma.project_wiki.findUnique({
      where: { id },
      select: { id: true }, // Minimal select for existence check
    });

    if (!wiki) {
      throw new NotFoundException(`Wiki with ID ${id} not found`);
    }

    // Only update the fields that are provided
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;

    return this.prisma.project_wiki.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        title: true,
        updated_at: true,
      },
    });
  }

  async updateAccessById(
    id: string,
    data: { access_level: WikiAccessLevel; is_public: boolean },
    userId: string,
  ) {
    const wiki = await this.prisma.project_wiki.findUnique({
      where: { id },
      select: { id: true, created_by: true }, // Minimal select for existence check
    });

    if (!wiki) {
      throw new NotFoundException(`Wiki with ID ${id} not found`);
    }
    if (userId !== wiki.created_by) {
      throw new ForbiddenException('You are not allowed to update this wiki');
    }

    return this.prisma.project_wiki.update({
      where: { id },
      data: {
        public_access_level: data.access_level,
        is_public: data.is_public,
      },
    });
  }

  async deleteById(id: string) {
    const wiki = await this.prisma.project_wiki.findUnique({
      where: { id },
      select: { id: true }, // Minimal select for existence check
    });

    if (!wiki) {
      throw new NotFoundException(`Wiki with ID ${id} not found`);
    }
    // Check if the wiki has any child wikis
    const childWikis = await this.prisma.project_wiki.findMany({
      where: { parent_id: id },
    });
    if (childWikis.length > 0) {
      // delete all comments related to child wikis
      await this.prisma.wiki_comments.deleteMany({
        where: { wiki_id: { in: childWikis.map((childWiki) => childWiki.id) } },
      });
      // delete all child wikis
      await this.prisma.project_wiki.deleteMany({
        where: { parent_id: id },
      });
    }

    // delete all comments related to the wiki
    await this.prisma.wiki_comments.deleteMany({
      where: { wiki_id: id },
    });

    await this.prisma.project_wiki.delete({
      where: { id },
    });

    return true;
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
    comment: wiki_comments & {
      user: users;
      replies?: (wiki_comments & { user: users })[];
    },
  ): WikiCommentResponse {
    return {
      id: comment.id,
      content: comment.content,
      userId: comment.user_id,
      user: {
        firstName: comment.user.first_name,
        lastName: comment.user.last_name,
        avatarUrl: comment.user.avatar_url,
      },
      wikiId: comment.wiki_id,
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
    dto: WikiCreateCommentDto,
  ): Promise<WikiCommentResponse> {
    // Get story with project details
    const wiki = await this.prisma.project_wiki.findUnique({
      where: { id: dto.wikiId },
      include: {
        projects: {
          select: {
            id: true,
            unique_name: true,
          },
        },
      },
    });

    if (!wiki) {
      throw new NotFoundException('Wiki not found');
    }

    // Extract mentions before creating comment
    const mentions = this.extractMentions(dto.content);

    if (dto.parentId) {
      const parentComment = await this.prisma.wiki_comments.findUnique({
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
        project_id: wiki.project_id,
      },
      include: {
        users: true,
      },
    });

    // Create the comment
    const comment = await this.prisma.wiki_comments.create({
      data: {
        content: dto.content,
        wiki_id: dto.wikiId,
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
    if (mentions.length > 0) {
      const validMentions = mentions
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
              title: wiki.title,
              type: 'Wiki',
              link: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/project/${wiki.projects.unique_name}/wiki/${wiki.id}`,
              content: sanitizedContent,
            },
          });
        }
      }
    }

    return this.mapToCommentResponse(comment);
  }

  async getComments(wikiId: string): Promise<WikiCommentResponse[]> {
    const comments = await this.prisma.wiki_comments.findMany({
      where: {
        wiki_id: wikiId,
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
    dto: WikiUpdateCommentDto,
  ): Promise<WikiCommentResponse> {
    const comment = await this.prisma.wiki_comments.findUnique({
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

    const updatedComment = await this.prisma.wiki_comments.update({
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

  async generateSprint(wikiId: string, data: WikiGenerateSprintDto) {
    const systemPrompts = prompts.getTasksFromSummaryPrompt();
    const wiki = await this.prisma.project_wiki.findUnique({
      where: { id: wikiId },
    });

    if (!wiki) {
      throw new NotFoundException('Wiki not found');
    }
    let sprintId: string | null = null;

    if (data.type === WikiGenerateType.CURRENT_SPRINT) {
      const currentSprint = await this.prisma.sprints.findFirst({
        where: {
          project_id: wiki.project_id,
        },
        orderBy: {
          sprint_number: 'desc',
        },
      });
      sprintId = currentSprint?.id;
    }

    const html = JSON.stringify(wiki.content);

    const res = await generateObjectAI({
      model: ModelType.GEMINI_2_0_FLASH,
      prompt: html,
      system: systemPrompts,
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
              project_id: wiki.project_id,
              sprint_id: sprintId,
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
                  project_id: wiki.project_id,
                  task_id: createdTask.id,
                },
              });
            }),
          );
        }),
      );
    }
    return true;
  }
}
