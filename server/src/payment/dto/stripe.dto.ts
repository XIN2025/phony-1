import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}

export class VerifyPaymentDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;
}
