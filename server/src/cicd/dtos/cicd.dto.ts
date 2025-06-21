import { cicd } from '@prisma/client';
import { IsString, IsDate, IsOptional, IsObject } from 'class-validator';

export class CicdDto {
  @IsString()
  id: string;

  @IsString()
  projectId: string;

  @IsString()
  awsAccessKey: string;

  @IsString()
  awsSecretKey: string;

  @IsString()
  awsRegion: string;

  @IsString()
  availabilityZone: string;

  @IsString()
  bundleId: string;

  @IsString()
  githubPat: string;

  @IsString()
  cloudflareZoneId: string;

  @IsString()
  cloudflareApiToken: string;

  @IsOptional()
  @IsString()
  publicIp?: string;

  @IsOptional()
  @IsString()
  instanceName?: string;

  @IsOptional()
  @IsString()
  dnsName?: string;

  @IsString()
  awsSshKey?: string;

  @IsDate()
  createdAt: Date;

  @IsOptional()
  @IsDate()
  lastDeployedAt?: Date;

  @IsString()
  githubRepoUrl: string;

  @IsString()
  blueprintId: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsObject()
  lastLogs?: object;
}

export class CreateVmDto {
  @IsString()
  accountType: string;

  @IsString()
  projectId: string;

  @IsString()
  @IsOptional()
  awsAccessKey?: string;

  @IsString()
  @IsOptional()
  awsSecretKey?: string;

  @IsString()
  @IsOptional()
  awsRegion?: string;

  @IsString()
  @IsOptional()
  availabilityZone?: string;

  @IsString()
  @IsOptional()
  awsSshKey?: string;

  @IsString()
  bundleId: string;

  @IsString()
  cloudflareZoneId: string;

  @IsString()
  cloudflareApiToken: string;

  @IsString()
  blueprintId: string;
}

export function mapToCicdDto(cicd: cicd): CicdDto {
  return {
    id: cicd.id,
    projectId: cicd.project_id,
    awsAccessKey: cicd.aws_access_key,
    awsSecretKey: cicd.aws_secret_key,
    awsRegion: cicd.aws_region,
    availabilityZone: cicd.availability_zone,
    bundleId: cicd.bundle_id,
    githubPat: cicd.github_pat,
    cloudflareZoneId: cicd.cloudflare_zone_id,
    cloudflareApiToken: cicd.cloudflare_api_token,
    publicIp: cicd.public_ip,
    instanceName: cicd.instance_name,
    dnsName: cicd.dns_name,
    awsSshKey: cicd.aws_ssh_key,
    createdAt: cicd.created_at,
    lastDeployedAt: cicd.last_deployed_at,
    githubRepoUrl: cicd.github_repo_url,
    blueprintId: cicd.blueprint_id,
    status: cicd.status,
    lastLogs: cicd.lastLogs as object,
  };
}

export function mapToCicdUserOnlyDto(cicd: cicd) {
  return {
    id: cicd.id,
    status: cicd.status,
    instanceName: cicd.instance_name,
    publicIp: cicd.public_ip,
    dnsName: cicd.dns_name,
    lastLogs: cicd.lastLogs as object,
  };
}
