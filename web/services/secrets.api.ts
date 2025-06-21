import {
  Environment,
  EnvironmentListItem,
  CreateEnvironmentDto,
  UpdateEnvironmentSecretsDto,
  SecretVersion,
  SecretVersionListItem,
} from '@/types/secrets';
import { ApiClient } from '@/lib/api-client';

export class SecretsService {
  /**
   * Gets all environments by project
   * @param projectId - The ID of the project
   * @returns The list of environments
   */
  static async getEnvironmentsByProject(projectId: string) {
    return await ApiClient.get<EnvironmentListItem[]>(`secrets/environmentsByProject/${projectId}`);
  }

  /**
   * Creates a new environment (ONLY Member with Admin Role can create an environment)
   * @param data - The data of the environment to create
   * @returns The created environment
   */
  static async createEnvironment(data: CreateEnvironmentDto) {
    return await ApiClient.post<Environment>('secrets/environments', data);
  }

  /**
   * Deletes an environment (ONLY Project Owner can delete an environment)
   * @param environmentId - The ID of the environment to delete
   * @returns The deleted environment
   */
  static async deleteEnvironment(environmentId: string) {
    return await ApiClient.delete<Environment>(`secrets/environments/${environmentId}`);
  }

  /**
   * Updates the secrets of an environment
   * @param environmentId - The ID of the environment to update
   * @param data - The data of the environment to update
   * @returns The updated environment
   */
  static async updateEnvironmentSecrets(environmentId: string, data: UpdateEnvironmentSecretsDto) {
    return await ApiClient.put<SecretVersion>(`secrets/environments/${environmentId}`, data);
  }

  /**
   * Gets all versions of an environment
   * @param environmentId - The ID of the environment
   * @returns The list of versions
   */
  static async getEnvironmentVersions(environmentId: string) {
    return await ApiClient.get<SecretVersionListItem[]>(
      `secrets/environments/${environmentId}/versions`,
    );
  }

  /**
   * Gets the latest version of an environment
   * @param environmentId - The ID of the environment
   * @returns The latest version
   */
  static async getLatestVersion(environmentId: string) {
    return await ApiClient.get<SecretVersion>(
      `secrets/environments/${environmentId}/versions/latest`,
    );
  }

  /**
   * Gets a specific version of an environment
   * @param environmentId - The ID of the environment
   * @param versionNumber - The number of the version to get
   * @returns The specific version
   */
  static async getSpecificVersion(environmentId: string, versionNumber: number) {
    return await ApiClient.get<SecretVersion>(
      `secrets/environments/${environmentId}/versions/${versionNumber}`,
    );
  }
}
