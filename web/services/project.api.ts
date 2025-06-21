import { SprintDataResponse } from '@/hooks/useSprintData';
import { ApiClient } from '@/lib/api-client';
import {
  CreateProjectWithoutRepoDto,
  CreateTemplateProjectDto,
  ImportProjectDto,
  Project,
  ProjectAnalytics,
  ProjectMember,
  Sprint,
  UpdateProjectDto,
} from '@/types/project';

export class ProjectService {
  static async getProjects(active?: boolean) {
    return await ApiClient.get<Project[]>('/projects', { active: active ?? false });
  }

  static async getArchivedProjects() {
    return await ApiClient.get<Project[]>('/projects/archived');
  }

  static async archiveProject(projectId: string) {
    return await ApiClient.put<Project>(`/projects/${projectId}/archive`);
  }

  static async unarchiveProject(projectId: string) {
    return await ApiClient.put<Project>(`/projects/${projectId}/unarchive`);
  }
  static async getProjectByName(name: string) {
    return await ApiClient.get<Project>(`/projects/name/${name}`);
  }
  static async updateProject(projectId: string, data: UpdateProjectDto) {
    return await ApiClient.put<Project>(`/projects/${projectId}`, data);
  }

  static async getProjectById(id: string) {
    return await ApiClient.get<Project>(`/projects/${id}`);
  }
  static async getProjectMembers(projectId: string) {
    return await ApiClient.get<ProjectMember[]>(`/projects/${projectId}/members`);
  }

  static async addProjectMember(projectId: string, email: string, role: string) {
    return await ApiClient.post<ProjectMember>(`/projects/${projectId}/members`, { email, role });
  }

  static async removeProjectMember(projectId: string, memberId: string) {
    return await ApiClient.delete<boolean>(`/projects/${projectId}/members/${memberId}`);
  }

  static async updateProjectMemberRole(projectId: string, memberId: string, role: string) {
    return await ApiClient.put<ProjectMember>(`/projects/${projectId}/members/${memberId}/role`, {
      role,
    });
  }

  static async deleteProject(id: string, requestUserId: string) {
    return await ApiClient.delete<boolean>(`/projects/${id}`, { requestUserId });
  }

  static async createSprint(projectId: string, formData: FormData) {
    return await ApiClient.post<Sprint>(`/projects/${projectId}/sprints`, formData);
  }

  static async updateSprint(sprintId: string, sprint: Partial<Sprint>) {
    return await ApiClient.put<Sprint>(`/sprints/${sprintId}`, sprint);
  }

  static async deleteSprint(sprintId: string) {
    return await ApiClient.delete<boolean>(`/sprints/${sprintId}`);
  }

  static async getUserSprints(range: string = 'default') {
    return await ApiClient.get<SprintDataResponse>(`/user/sprints`, { range });
  }

  static async importProject(projectData: ImportProjectDto) {
    return await ApiClient.post<Project>(`/projects/import`, projectData);
  }

  static async createTemplateProject(projectData: CreateTemplateProjectDto) {
    return await ApiClient.post<Project>(`/projects/template`, projectData);
  }

  static async createProjectWithoutRepo(projectDetails: CreateProjectWithoutRepoDto) {
    return await ApiClient.post<Project>(`/projects`, projectDetails);
  }

  static async updateModelType(projectId: string, modelType: string) {
    return await ApiClient.put<Project>(`/projects/${projectId}/model-type`, {
      model_type: modelType,
    });
  }

  static async getProjectAnalytics(projectId: string) {
    return await ApiClient.get<ProjectAnalytics>(`/projects/${projectId}/analytics`);
  }

  static async transcribeAudio(projectId: string | null, formData: FormData) {
    formData.append('projectId', projectId ?? '');
    return await ApiClient.post<boolean>(`/projects/transcribe`, formData);
  }
}
