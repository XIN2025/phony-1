import { IsArray, IsString } from 'class-validator';
import { Message } from 'ai';

export class ChatBotQueryDto {
  @IsArray()
  messages: Message[];

  @IsString()
  id: string;

  @IsString()
  projectName: string;
}
