import { ApiClient } from '@/lib/api-client';
import { CreateMeetingData, MeetingData, UpdateMeetingData } from '@/types/meeting-data';

export class MeetingDataService {
  static async createMeetingData(meetingData: CreateMeetingData) {
    return await ApiClient.post<MeetingData>('meeting-data', meetingData);
  }

  static async generateUserStories(data: FormData) {
    return await ApiClient.post<boolean>('meeting-data/generate-stories', data);
  }

  static async getMeetingDataByProjectId(projectId: string) {
    return await ApiClient.get<MeetingData[]>(`meeting-data/project/${projectId}`);
  }

  static async getGlobalMeetings() {
    return await ApiClient.get<MeetingData[]>('meeting-data/global');
  }

  static async moveToProject(meetingId: string, projectId: string) {
    return await ApiClient.patch<MeetingData>(
      `meeting-data/${meetingId}/moveToProject/${projectId}`,
    );
  }

  static async updateMeetingData(meetingDataId: string, meetingData: UpdateMeetingData) {
    return await ApiClient.patch<MeetingData>(`meeting-data/${meetingDataId}`, meetingData);
  }

  static async deleteMeetingData(meetingDataId: string) {
    return await ApiClient.delete<boolean>(`meeting-data/${meetingDataId}`);
  }
}
