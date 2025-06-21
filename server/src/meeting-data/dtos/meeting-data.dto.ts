import {
  IsString,
  IsDate,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  IsObject,
} from 'class-validator';
import { mapToProjectResourceDto } from 'src/project-resources/dtos/project-resources.dto';

export class MeetingDataDto {
  @IsString()
  id: string;

  @IsString()
  @IsOptional()
  projectId?: string | null;

  @IsString()
  @IsOptional()
  resourceId?: string | null;

  @IsString()
  createdBy: string;

  creator?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  transcript?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsObject()
  metadata?: any;

  @IsOptional()
  @IsBoolean()
  isStoriesCreated?: boolean;

  @IsOptional()
  resource?: any;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}

export class UpdateMeetingDataDto {
  @IsOptional()
  @IsString()
  transcript?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsObject()
  metadata?: any;
}
export class CreateMeetingDataDto {
  @IsString()
  @IsOptional()
  projectId?: string | null;

  @IsString()
  @IsOptional()
  resourceId?: string;

  @IsString()
  @IsNotEmpty()
  transcript: string;

  @IsOptional()
  @IsObject()
  metadata?: any;

  @IsString()
  @IsNotEmpty()
  createdBy: string;
}

export function mapToMeetingDataDto(meetingData: any): MeetingDataDto {
  return {
    id: meetingData.id,
    projectId: meetingData.project_id,
    resourceId: meetingData.resource_id,
    createdBy: meetingData.createdBy,
    creator: meetingData.creator
      ? {
          id: meetingData.creator.id,
          first_name: meetingData.creator.first_name,
          last_name: meetingData.creator.last_name,
          avatar_url: meetingData.creator.avatar_url,
        }
      : undefined,
    transcript: meetingData.transcript,
    summary: meetingData.summary,
    metadata: meetingData.metadata,
    title: meetingData.title,
    resource: meetingData.resources
      ? mapToProjectResourceDto(meetingData.resources)
      : undefined,
    createdAt: meetingData.created_at,
    updatedAt: meetingData.updated_at,
    isStoriesCreated: meetingData.isStoriesCreated || false,
  };
}
