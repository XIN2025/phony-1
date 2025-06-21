import { ApiClient } from '@/lib/api-client';
import { UpdateWikiAccessData, UpdateWikiData, Wiki } from '@/types/wiki';

export interface WikiComment {
  id: string;
  content: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  wikiId: string;
  parentId?: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: WikiComment[];
}

export interface WikiCreateCommentDto {
  wikiId: string;
  content: string;
  parentId?: string;
}

export interface WikiUpdateCommentDto {
  content?: string;
}

export class WikiService {
  static async createWiki(projectId: string, parentId: string | null = null) {
    return await ApiClient.post<Wiki>(`wiki/project/${projectId}`, { parentId });
  }
  static async findByProjectId(projectId: string) {
    return await ApiClient.get<Wiki[]>(`wiki/project/${projectId}`);
  }

  static async findById(wikiId: string) {
    return await ApiClient.get<Wiki>(`wiki/${wikiId}`);
  }

  static async updateById(wikiId: string, data: UpdateWikiData) {
    return await ApiClient.put<{
      id: string;
      title: string;
      updated_at: string;
    }>(`wiki/${wikiId}`, data);
  }
  static async updateAccessById(wikiId: string, data: UpdateWikiAccessData) {
    return await ApiClient.put<{
      id: string;
      title: string;
      updated_at: string;
    }>(`wiki/${wikiId}/access`, data);
  }

  static async deleteById(wikiId: string) {
    return await ApiClient.delete<boolean>(`wiki/${wikiId}`);
  }

  static async getComments(wikiId: string) {
    return await ApiClient.get<WikiComment[]>(`wiki/${wikiId}/comments`);
  }

  static async addComment(comment: WikiCreateCommentDto) {
    return await ApiClient.post<Comment>(`wiki/comment`, comment);
  }
  static async deleteComment(commentId: string) {
    return await ApiClient.delete<boolean>(`wiki/comment/${commentId}`);
  }

  static async updateComment(commentId: string, comment: WikiUpdateCommentDto) {
    return await ApiClient.put<WikiComment>(`wiki/comment/${commentId}`, comment);
  }

  static async generateSprint(wikiId: string, data: { type: 'current_sprint' | 'backlog' }) {
    return await ApiClient.post<Wiki>(`wiki/${wikiId}/generate-sprint`, data);
  }
}
