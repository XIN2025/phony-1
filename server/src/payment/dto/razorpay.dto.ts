import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyRazorPayPaymentDto {
  @IsNotEmpty()
  @IsString()
  transactionId: string;

  @IsNotEmpty()
  @IsString()
  razorpay_payment_id: string;

  @IsNotEmpty()
  @IsString()
  razorpay_order_id: string;

  @IsNotEmpty()
  @IsString()
  razorpay_signature: string;
}
