import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class UpdateCouponDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsOptional()
  @IsNumber()
  max_uses?: number;

  @IsOptional()
  @IsDateString()
  expires_at?: string;
}
