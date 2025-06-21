import { ApiClient } from '@/lib/api-client';

export interface CommentMention {
  id: string;
  display: string;
  index: number;
  length: number;
  userId: string;
}

export interface Comment {
  id: string;
  content: string;
  formattedContent?: {
    mentions?: CommentMention[];
  };
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  storyId: string;
  parentId?: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

export interface CreateCommentDto {
  storyId: string;
  content: string;
  formattedContent?: {
    mentions?: CommentMention[];
  };
  parentId?: string;
}

export interface UpdateCommentDto {
  content?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formattedContent?: Record<string, any>;
}

export class CommentService {
  static async createComment(data: CreateCommentDto) {
    return await ApiClient.post<Comment>('story-comments', data);
  }

  static async getComments(storyId: string) {
    return await ApiClient.get<Comment[]>(`story-comments/${storyId}`);
  }

  static async updateComment(commentId: string, data: UpdateCommentDto) {
    return await ApiClient.put<Comment>(`story-comments/${commentId}`, data);
  }

  static async deleteComment(commentId: string) {
    return await ApiClient.delete<boolean>(`story-comments/${commentId}`);
  }
}
