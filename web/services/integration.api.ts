import { ApiClient } from '@/lib/api-client';
import { Bug } from '@/types/bug';
import { LogMeetingData, MeetingData } from '@/types/meeting-data';
import { UserStoriesDto } from '@/types/user-stories';

export class IntegrationService {
  static async getUserStoriesByProjectName(projectName: string) {
    return await ApiClient.get<UserStoriesDto[]>(`integrations/stories/${projectName}`, undefined, {
      'x-api-key': process.env.DEVTOOLS_SECRET!,
    });
  }

  static async getBugsByProjectName(projectName: string) {
    return await ApiClient.get<Bug[]>(`integrations/bugs/${projectName}`, undefined, {
      'x-api-key': process.env.DEVTOOLS_SECRET!,
    });
  }

  static async getMeetingDataByProjectName(projectName: string) {
    return await ApiClient.get<LogMeetingData[]>(`integrations/mom/${projectName}`, undefined, {
      'x-api-key': process.env.DEVTOOLS_SECRET!,
    });
  }
}
