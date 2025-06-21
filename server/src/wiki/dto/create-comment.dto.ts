import { IsString, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';

export class WikiCreateCommentDto {
  @IsNotEmpty()
  @IsString()
  wikiId: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}

export enum WikiGenerateType {
  CURRENT_SPRINT = 'current_sprint',
  BACKLOG = 'backlog',
}

export class WikiGenerateSprintDto {
  @IsEnum(WikiGenerateType)
  type: WikiGenerateType;
}
