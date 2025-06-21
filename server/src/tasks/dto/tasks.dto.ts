import {
  IsString,
  IsOptional,
  IsEnum,
  IsDate,
  IsNumber,
  IsArray,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { FeatureType, GenerationStatus } from '@prisma/client';

export class TaskDto {
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  research?: any;

  @IsEnum(FeatureType)
  type: FeatureType;

  @IsEnum(GenerationStatus)
  storyStatus: GenerationStatus;

  @IsString()
  sprintId: string;

  @IsString()
  projectId: string;

  @IsArray()
  stories: UserStoriesDto[];

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}

export class AcceptanceCriteria {
  @IsString()
  criteria: string;

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
}
export class UserStoriesDto {
  @IsString()
  id: string;

  @IsString()
  projectId: string;

  @IsString()
  sprintId: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  estimation: number;

  @IsNumber()
  priority: number;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsObject()
  research: any;

  @IsArray()
  acceptanceCriteria: AcceptanceCriteria[];

  @IsString()
  dbSchemaPrompt: string;

  @IsString()
  apiPrompt: string;

  @IsString()
  uiPrompt: string;

  @IsString()
  status: string;

  @IsString()
  assignedTo: string;

  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    email?: string;
  };
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    email?: string;
  };

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(FeatureType)
  type?: FeatureType;
}

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(FeatureType)
  type: FeatureType;

  @IsString()
  projectId: string;

  @IsString()
  @IsOptional()
  sprintId?: string;
}

export function mapToTaskDto(task: any): TaskDto {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    type: task.type,
    research: task.research,
    storyStatus: task.story_status,
    sprintId: task.sprint_id,
    projectId: task.project_id,
    stories: task.stories?.map((story) => mapToUserStoriesDto(story)) ?? [],
    createdAt: task.created_at,
    updatedAt: task.updated_at,
  };
}

export function mapToUserStoriesDto(story: any): UserStoriesDto {
  return {
    id: story.id,
    projectId: story.project_id,
    sprintId: story.sprint_id,
    title: story.title,
    description: story.description,
    estimation: story.estimation,
    order: story.order,
    acceptanceCriteria: story.acceptance_criteria,
    status: story.status,
    dbSchemaPrompt: story.db_schema_prompt,
    apiPrompt: story.api_prompt,
    uiPrompt: story.ui_prompt,
    assignedTo: story.assigned_to,
    priority: story.priority,
    research: story.research,
    assignee: story.assignee
      ? {
          id: story.assignee.id,
          firstName: story.assignee.first_name,
          lastName: story.assignee.last_name,
          avatarUrl: story.assignee.avatar_url,
          email: story.assignee.email,
        }
      : null,
    creator: story.creator
      ? {
          id: story.creator.id,
          firstName: story.creator.first_name,
          lastName: story.creator.last_name,
          avatarUrl: story.creator.avatar_url,
          email: story.creator.email,
        }
      : null,
    createdAt: story.created_at,
    updatedAt: story.updated_at,
  };
}

export class MoveStoryToTaskDto {
  @IsString()
  taskId: string;
}
