import { IsString, IsNotEmpty } from 'class-validator';

export class GenerateStoriesDto {
  @IsString()
  @IsNotEmpty()
  taskId: string;

  @IsString()
  @IsNotEmpty()
  projectId: string;
}
