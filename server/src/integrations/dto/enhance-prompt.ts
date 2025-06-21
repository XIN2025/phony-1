import { IsNotEmpty, IsString } from 'class-validator';

export class EnhancePromptDto {
  @IsString()
  @IsNotEmpty()
  currentPrompt: string;

  @IsString()
  @IsNotEmpty()
  codeContext: string;

  @IsString()
  url: string;
}
