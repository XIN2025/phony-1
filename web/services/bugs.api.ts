import { ApiClient } from '@/lib/api-client';
import {
  Bug,
  BugStatusType,
  GetBugsOptions,
  PaginatedBugs,
  TaskFromBug,
  BugComment,
  BugCreateCommentDto,
  BugUpdateCommentDto,
  UpdateBugDto,
} from '@/types/bug';

export class BugsService {
  /**
   * Get bugs with pagination and filtering options
   * @param projectId Project ID
   * @param options Pagination and filtering options
   * @returns Paginated bugs data
   */
  static async getBugs(projectId: string, options?: GetBugsOptions) {
    return await ApiClient.get<PaginatedBugs>(`/bugs/byProject/${projectId}`, options);
  }

  /**
   * Creates a new bug
   * @param formData FormData object containing bug data
   * @param formData.projectId Project ID
   * @param formData.textFeedback Text feedback
   * @param formData.screenshots Screenshots - images
   * @param formData.voiceFeedback Voice feedback - audio
   * @returns Created bug data
   */
  static async createBug(formData: FormData) {
    return await ApiClient.post<Bug>('/bugs', formData);
  }

  /**
   * Delete a bug
   * @param id Bug ID
   * @returns Success response
   */
  static async deleteBug(id: string) {
    return await ApiClient.delete<boolean>(`/bugs/${id}`);
  }

  /**
   * Update bug status
   * @param id Bug ID
   * @param status New status
   * @returns Updated bug data
   */
  static async updateBugStatus(id: string, status: BugStatusType) {
    return await ApiClient.put<boolean>(`/bugs/${id}/status`, { status });
  }

  /**
   * Assign or unassign a bug to a user
   * @param id Bug ID
   * @param assigneeId User ID to assign, or null to unassign
   * @returns Updated bug data
   */
  static async updateBugAssignee(id: string, assigneeId: string | null) {
    return await ApiClient.put<Bug>(`/bugs/${id}/assignee`, { assigneeId });
  }

  /**
   * Convert a bug into a task
   * @param id Bug ID
   * @returns Created task data
   */
  static async convertToTask(id: string) {
    return await ApiClient.post<TaskFromBug>(`/bugs/${id}/convert-to-task`);
  }
  static async updateBug(bugId: string, dto: UpdateBugDto) {
    return await ApiClient.put<Bug>(`bugs/${bugId}`, dto);
  }

  static async getComments(bugId: string) {
    return await ApiClient.get<BugComment[]>(`bugs/${bugId}/comments`);
  }

  static async addComment(comment: BugCreateCommentDto) {
    return await ApiClient.post<BugComment>(`bugs/comment`, comment);
  }
  static async deleteComment(commentId: string) {
    return await ApiClient.delete<boolean>(`wiki/comment/${commentId}`);
  }

  static async updateComment(commentId: string, comment: BugUpdateCommentDto) {
    return await ApiClient.put<BugComment>(`bugs/comment/${commentId}`, comment);
  }
}
