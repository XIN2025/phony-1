import {
  GithubOwner,
  GithubRepository,
  GithubBranch,
  GithubStatus,
  GithubRepo,
} from '@/types/github';
import { ApiClient } from '@/lib/api-client';

export class GithubService {
  static async getGithubStatus() {
    return await ApiClient.get<GithubStatus>('github/status');
  }

  static async connectGithubRepo(params: {
    githubBranch: string;
    githubRepo: string;
    githubOwner: string;
    projectId: string;
  }) {
    return await ApiClient.post<GithubRepo>('github/connect', params);
  }

  static async createCodeSpaceForUser(projectId: string) {
    return await ApiClient.post<string>(`github/${projectId}/createCodespace`);
  }

  static async getGithubOwners() {
    return await ApiClient.get<GithubOwner[]>('github/owners');
  }

  static async getGithubRepositories(owner: string, ownerType: string, page: number = 1) {
    return await ApiClient.get<{
      data: GithubRepository[];
      nextPage: number | null;
    }>(`github/${owner}/repos?page=${page}&ownerType=${ownerType}`);
  }

  static async getGithubBranches(owner: string, repo: string, page: number = 1) {
    return await ApiClient.get<{
      data: GithubBranch[];
      nextPage: number | null;
    }>(`github/${owner}/${repo}/branches?page=${page}`);
  }

  static async checkGithubRepositoryAvailability(owner: string, repo: string) {
    return await ApiClient.get<boolean>(`github/${owner}/${repo}/check`);
  }

  static async getGithubRepoByProjectId(projectId: string) {
    return await ApiClient.get<GithubRepo>(`github/repo/${projectId}`);
  }
}
