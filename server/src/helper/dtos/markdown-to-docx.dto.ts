import { IsNotEmpty, IsString } from 'class-validator';

export class MarkdownToDocxDto {
  @IsString()
  @IsNotEmpty()
  markdown: string;

  @IsString()
  @IsNotEmpty()
  filename: string;
}
