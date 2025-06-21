import { ApiClient } from '@/lib/api-client';

export class DeploymentService {
  static async deployProject(projectId: string) {
    const response = await ApiClient.post<boolean>(`cicd/deploy/${projectId}`);
    if (response.error) {
      return false;
    }
    return response.data;
  }

  static async setupVM(
    projectId: string,
    setupData: {
      accountType: string;
      bundleId: string;
      awsSshKey?: string;
      awsAccessKey?: string;
      awsSecretKey?: string;
      awsRegion?: string;
      availabilityZone?: string;
    },
  ) {
    let payload;
    if (setupData.accountType === 'opengig') {
      payload = {
        accountType: 'og',
        projectId: projectId,
        bundleId: setupData.bundleId,
        blueprintId: 'ubuntu_22_04',
      };
    } else {
      const formattedsshKey = setupData.awsSshKey?.replace(/ /g, '\n') || '';
      payload = {
        accountType: 'custom',
        bundleId: setupData.bundleId,
        blueprintId: 'ubuntu_22_04',
        awsAccessKey: setupData.awsAccessKey,
        awsSecretKey: setupData.awsSecretKey,
        awsRegion: setupData.awsRegion,
        availabilityZone: setupData.availabilityZone,
        awsSshKey: formattedsshKey,
        // cloudflareZoneId: cloudflare_zone_id,
        // cloudflareApiToken: cloudflare_api_token,
      };
    }

    const response = await ApiClient.post<boolean>(`cicd/create-vm`, payload);
    if (response.error) {
      return false;
    }
    return response.data;
  }
}
