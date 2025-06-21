import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentResponse } from './types/comment.types';
import { MENTION_NOTIFICATION_TEMPLATE } from '../mail/templates/mention-notification';
import { COMMENT_NOTIFICATION_TEMPLATE } from '../mail/templates/comment-notification';
import { emailTemplateWrapper } from 'src/mail/templates/wrapper';

@Injectable()
export class StoryCommentsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

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

  private mapToCommentResponse(comment: any): CommentResponse {
    return {
      id: comment.id,
      content: comment.content,
      formattedContent: comment.formatted_content,
      userId: comment.user_id,
      user: {
        firstName: comment.user.first_name,
        lastName: comment.user.last_name,
        avatarUrl: comment.user.avatar_url,
      },
      storyId: comment.story_id,
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
    dto: CreateCommentDto,
  ): Promise<CommentResponse> {
    // Get story with project and creator details
    const story = await this.prisma.story.findUnique({
      where: { id: dto.storyId },
      include: {
        projects: true,
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

    if (!story) {
      throw new NotFoundException('Story not found');
    }

    // Extract mentions before creating comment
    const mentions = this.extractMentions(dto.content);

    if (dto.parentId) {
      const parentComment = await this.prisma.story_comments.findUnique({
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
        project_id: story.project_id,
      },
      include: {
        users: true,
      },
    });

    // Create the comment
    const comment = await this.prisma.story_comments.create({
      data: {
        content: dto.content,
        formatted_content: dto.formattedContent,
        story_id: dto.storyId,
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
              title: story.title,
              type: 'story',
              link: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/project/${story.projects.unique_name}?storyId=${story.id}`,
              content: sanitizedContent,
            },
          });
        }
      }
    }

    // Send notification to story creator if the commenter is not the creator and creator exists
    if (
      story.creator &&
      story.creator.email &&
      !validMentions
        .map((mention) => mention.userId)
        .includes(story.creator.id) &&
      story.creator.id !== userId
    ) {
      this.mailService.sendTemplateMail({
        to: story.creator.email,
        subject: `💬 New comment on your story: ${story.title}`,
        template: emailTemplateWrapper(COMMENT_NOTIFICATION_TEMPLATE),
        context: {
          commenterName: `${commenter?.first_name} ${commenter?.last_name}`,
          title: story.title,
          type: 'story',
          link: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/project/${story.projects.unique_name}?storyId=${story.id}`,
          content: sanitizedContent,
        },
      });
    }

    return this.mapToCommentResponse(comment);
  }

  async getComments(storyId: string): Promise<CommentResponse[]> {
    const comments = await this.prisma.story_comments.findMany({
      where: {
        story_id: storyId,
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
    dto: UpdateCommentDto,
  ): Promise<CommentResponse> {
    const comment = await this.prisma.story_comments.findUnique({
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

    const updatedComment = await this.prisma.story_comments.update({
      where: { id: commentId },
      data: {
        content: dto.content,
        formatted_content: dto.formattedContent,
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
    const comment = await this.prisma.story_comments.findUnique({
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

    await this.prisma.story_comments.delete({
      where: { id: commentId },
    });

    return true;
  }
}
