import { SprintStatus } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateSprintDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  requirements?: string;

  @IsEnum(SprintStatus)
  @IsOptional()
  status?: SprintStatus;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}

export class CreateSprintDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsBoolean()
  @IsOptional()
  shiftData?: boolean = false;

  @IsString()
  @IsOptional()
  requirements?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
