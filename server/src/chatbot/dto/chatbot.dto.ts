import { IsNotEmpty, IsString } from 'class-validator';

export class ChatBotGenerateEmbeddingDto {
  @IsString()
  @IsNotEmpty()
  projectName: string;
}
