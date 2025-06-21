import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  storyId: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  formattedContent?: Record<string, any>;

  @IsOptional()
  @IsString()
  parentId?: string;
}
