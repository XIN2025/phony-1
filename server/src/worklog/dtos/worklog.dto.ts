import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateWorklogDto {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @Min(0.01)
  @IsNumber()
  @IsNotEmpty()
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

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  date: string;
}

export class UpdateWorklogDto {
  @IsNumber()
  @IsNotEmpty()
  hoursWorked: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  date: string;
}

export class WorklogParams {
  @IsString()
  @IsOptional()
  projectName?: string;

  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  timezone: string;
}
