import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TranscribeDto {
  @IsString()
  @IsNotEmpty()
  startDate: string;

  @IsString()
  @IsNotEmpty()
  endDate: string;

  @IsString()
  @IsNotEmpty()
  audioDuration: string;

  @IsString()
  @IsOptional()
  projectId?: string;
}
