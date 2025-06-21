import { ApiClient } from '@/lib/api-client';
import {
  createTaskDto,
  TaskDto,
  UpdateTaskDto,
  ReorderTasksDto,
  ReorderStoriesDto,
} from '@/types/user-stories';

export class TaskService {
  static async createTask(body: createTaskDto) {
    return await ApiClient.post<TaskDto>(`tasks/create`, body);
  }

  static async generateTasksForSprint(sprintId: string, projectId: string) {
    return await ApiClient.post<boolean>(`tasks`, { sprintId, projectId });
  }

  static async updateTask(taskId: string, data: UpdateTaskDto) {
    return await ApiClient.put<TaskDto>(`tasks/${taskId}`, data);
  }

  static async deleteTask(taskId: string) {
    return await ApiClient.delete<boolean>(`tasks/${taskId}`);
  }

  static async getTasks(sprintId: string) {
    return await ApiClient.get<TaskDto[]>(`tasks/sprint/${sprintId}`);
  }

  static async getBacklogTasks(projectId: string) {
    return await ApiClient.get<TaskDto[]>(`tasks/backlog/${projectId}`);
  }

  static async moveTaskToBacklog(taskId: string) {
    return await ApiClient.put<TaskDto>(`tasks/${taskId}/move-to-backlog`);
  }

  static async moveTaskToSprint(taskId: string) {
    return await ApiClient.put<TaskDto>(`tasks/${taskId}/move-to-sprint`);
  }

  static async reorderTasks(tasks: ReorderTasksDto) {
    return await ApiClient.put<boolean>('tasks/reorder', { tasks });
  }
  static async reorderStories(stories: ReorderStoriesDto) {
    return await ApiClient.put<boolean>('tasks/stories/reorder', { stories });
  }
}
