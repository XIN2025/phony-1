import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export interface BugCommentResponse {
  id: string;
  content: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  bugId: string;
  parentId?: string;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
  replies?: BugCommentResponse[];
}

export class BugCreateCommentDto {
  @IsNotEmpty()
  @IsString()
  bugId: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}

export class BugUpdateCommentDto {
  @IsOptional()
  @IsString()
  content?: string;
}
