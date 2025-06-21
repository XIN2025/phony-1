import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { AcceptanceCriteria } from './tasks.dto';
import { Type } from 'class-transformer';

export class CreateStoryDto {
  @IsString()
  title: string;
  @IsString()
  description: string;
  @IsString()
  projectId: string;
  @IsString()
  @IsOptional()
  sprintId?: string;
  @IsString()
  taskId: string;
  @IsNumber()
  estimation: number;
}
export class UpdateStoryDto {
  @IsString()
  title: string;
  @IsString()
  description: string;

  @IsNumber()
  estimation: number;

  @IsNumber()
  priority: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AcceptanceCriteria)
  acceptanceCriteria: AcceptanceCriteria[];

  @IsString()
  status: string;

  @IsString()
  @IsOptional()
  assignedTo?: string;

  @IsString()
  @IsOptional()
  dbSchemaPrompt?: string;

  @IsString()
  @IsOptional()
  apiPrompt?: string;

  @IsString()
  @IsOptional()
  uiPrompt?: string;
}

export class UpdateStoryTaskDto {
  @IsString()
  taskId: string;
}

export class WorklogDto {
  @IsString()
  projectName: string;

  @IsString()
  userEmail: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  hoursWorked: number;

  @IsString()
  @IsOptional()
  storyId?: string;

  @IsString()
  @IsOptional()
  bugId?: string;

  @IsString()
  @IsOptional()
  meetingId?: string;

  @IsString()
  @IsOptional()
  wikiId?: string;
}
