import { IsString, IsOptional } from 'class-validator';

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  formattedContent?: Record<string, any>;
}
