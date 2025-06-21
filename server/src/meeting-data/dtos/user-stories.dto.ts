import { IsOptional, IsString } from 'class-validator';
import { IsNotEmpty } from 'class-validator';

export class GenerateUserStoriesDto {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  @IsNotEmpty()
  sprintOption: 'current' | 'backlog';

  @IsString()
  @IsNotEmpty()
  meetingId: string;

  @IsString()
  @IsNotEmpty()
  summary: string;

  @IsString()
  @IsOptional()
  storyInput?: string;
}
