import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { IsOptional } from 'class-validator';

export class MeetingDataDto {
  @IsString()
  @IsNotEmpty()
  meetingLink: string;

  @IsString()
  @IsOptional()
  transcript?: string;

  @IsObject()
  @IsOptional()
  metadata?: any;

  @IsString()
  @IsNotEmpty()
  createdBy: string;
}
