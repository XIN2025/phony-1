import { IsString, IsOptional } from 'class-validator';

export class ChatBotMessageDto {
  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  conversationId?: string;

  @IsString()
  projectName: string;

  @IsString()
  @IsOptional()
  role?: string;
}
