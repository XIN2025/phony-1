import { ApiClient } from '@/lib/api-client';
import { createStoryDto, UserStoriesDto } from '@/types/user-stories';

export class UserStoryService {
  static async createStory(story: createStoryDto) {
    return await ApiClient.post<UserStoriesDto>(`tasks/user-stories/story`, story);
  }

  static async deleteStory(id: string) {
    return await ApiClient.delete<boolean>(`tasks/user-stories/story/${id}`);
  }

  static async updateUserStories(id: string, story: UserStoriesDto) {
    return await ApiClient.put<UserStoriesDto>(`tasks/user-stories/story/${id}`, { ...story });
  }

  static async generateUserStoriesForTask(taskId: string, projectId: string) {
    return await ApiClient.post<boolean>(`tasks/user-stories`, { taskId, projectId });
  }
  static async moveStoryToTask(storyId: string, taskId: string) {
    return await ApiClient.put<UserStoriesDto>(`tasks/user-stories/story/${storyId}/task`, {
      taskId,
    });
  }
}
