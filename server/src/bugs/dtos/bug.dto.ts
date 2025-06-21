import { BugStatus } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBugDto {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  @IsOptional()
  textFeedback?: string;
}

export class CreateBugFilesDto {
  @IsArray()
  @IsOptional()
  screenshots?: Express.Multer.File[];

  @IsArray()
  @IsOptional()
  voiceFeedback?: Express.Multer.File[];
}

export class GetBugsByProjectQueryDto {
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  limit?: number = 10;

  @IsEnum(BugStatus)
  @IsOptional()
  status?: BugStatus;
}

export class UpdateBugStatusDto {
  @IsEnum(BugStatus)
  @IsNotEmpty()
  status: BugStatus;
}

export class UpdateBugAssigneeDto {
  @IsString()
  @IsOptional()
  assigneeId?: string | null;
}

export class UpdateBugDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  textFeedback?: string;
}
