import { ApiClient } from '@/lib/api-client';
import { CreateProjectResourceDto, ProjectResource } from '@/types/project-resource';

export class ProjectResourceService {
  static async createProjectResource(formdata: CreateProjectResourceDto) {
    return await ApiClient.post<ProjectResource>('/project-resources', formdata);
  }

  static async getProjectResources(projectId: string) {
    return await ApiClient.get<ProjectResource[]>(`/project-resources/${projectId}`);
  }

  static async updateProjectResource(resourceId: string, resource: CreateProjectResourceDto) {
    return await ApiClient.put<ProjectResource>(`/project-resources/${resourceId}`, resource);
  }

  static async deleteProjectResource(resourceId: string) {
    return await ApiClient.delete<boolean>(`/project-resources/${resourceId}`);
  }
}
