export interface LightsailDeploymentConfig {
  port?: string;
  encryptionKey?: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  awsRegion?: string;
  availabilityZone?: string;
  awsSshKey?: string;
  cloudflareZoneId?: string;
  cloudflareApiToken?: string;
}

export interface LightsailInstance {
  name: string;
  blueprintId: string;
  bundleId: string;
  availabilityZone: string;
  userData?: string;
  keyPairName?: string;
  tags?: Array<{
    key: string;
    value: string;
  }>;
}

export interface LightsailDeploymentOptions {
  instanceName: string;
  blueprint: string;
  bundle: string;
  region: string;
  availabilityZone: string;
  sshKeyName?: string;
  userData?: string;
  domainName?: string;
  subdomain?: string;
  enableCloudflare?: boolean;
}

export interface LightsailDeploymentResult {
  success: boolean;
  instanceId?: string;
  publicIpAddress?: string;
  privateIpAddress?: string;
  domainConfigured?: boolean;
  error?: string;
  logs?: string[];
}
