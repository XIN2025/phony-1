import {
  IsString,
  IsDate,
  IsArray,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateProjectResourceDto {
  @IsString()
  projectId: string;

  @IsString()
  resourceType: string;

  @IsString()
  resourceURL: string;

  @IsString()
  resourceName: string;

  @IsString()
  @IsOptional()
  scheduleType?: string;

  @IsString()
  @IsOptional()
  scheduleTime?: string;

  @IsArray()
  @IsOptional()
  scheduleDays?: string[];

  @IsDateString()
  @IsOptional()
  scheduleDate?: Date;

  @IsString()
  @IsOptional()
  cronExpression?: string;
}

export class ProjectResourceDto {
  @IsString()
  id: string;

  @IsString()
  projectId: string;

  @IsString()
  resourceType: string;

  @IsString()
  resourceURL: string;

  @IsString()
  resourceName: string;

  @IsString()
  @IsOptional()
  scheduleType?: string;

  @IsString()
  @IsOptional()
  scheduleTime: string;

  @IsArray()
  @IsOptional()
  scheduleDays: string[];

  @IsDate()
  @IsOptional()
  scheduleDate: Date;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}

export function mapToProjectResourceDto(resource: any): ProjectResourceDto {
  return {
    id: resource.id,
    projectId: resource.project_id,
    resourceType: resource.resource_type,
    resourceURL: resource.resource_url,
    resourceName: resource.resource_name,
    scheduleType: resource.schedule_type,
    scheduleTime: resource.schedule_time,
    scheduleDays: resource.schedule_days,
    scheduleDate: resource.schedule_date,
    createdAt: resource.created_at,
    updatedAt: resource.updated_at,
  };
}

export function mapToProjectResourceDtoArray(
  resources: any[],
): ProjectResourceDto[] {
  return resources.map(mapToProjectResourceDto);
}
