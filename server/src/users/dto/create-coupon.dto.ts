import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateCouponDto {
  @IsString()
  code: string;

  @IsString()
  description: string;

  @IsNumber()
  discount: number;

  @IsNumber()
  max_uses: number;

  @IsOptional()
  @IsDateString()
  expires_at?: string;
}
