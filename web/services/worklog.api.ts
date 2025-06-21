import { ApiClient } from '@/lib/api-client';
import { CreateWorklogDto, UpdateWorklogDto, WorklogDto, WorklogParams } from '@/types/worklog';

export class WorklogService {
  static async createWorklog(worklog: CreateWorklogDto) {
    return await ApiClient.post<WorklogDto>('/worklogs', worklog);
  }

  static async updateWorklog(id: string, worklog: UpdateWorklogDto) {
    return await ApiClient.put<WorklogDto>(`/worklogs/${id}`, worklog);
  }

  static async deleteWorklog(id: string) {
    return await ApiClient.delete<boolean>(`/worklogs/${id}`);
  }

  static async getMyWorklogs(params?: WorklogParams) {
    return await ApiClient.get<WorklogDto[]>(`/worklogs/me`, params);
  }
}
