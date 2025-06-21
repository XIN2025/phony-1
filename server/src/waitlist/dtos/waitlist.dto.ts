import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export enum WaitlistStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class CreateWaitlistDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  from?: string;
}

export class UpdateWaitlistDto {
  @IsEnum(WaitlistStatus)
  status: WaitlistStatus;
}

export class WaitlistResponseDto {
  id: string;
  email: string;
  name?: string | null;
  from?: string | null;
  status: WaitlistStatus;
  created_at: Date;
  updated_at: Date;
}
