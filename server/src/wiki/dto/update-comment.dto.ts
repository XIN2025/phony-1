import { IsString, IsOptional } from 'class-validator';

export class WikiUpdateCommentDto {
  @IsOptional()
  @IsString()
  content?: string;
}
