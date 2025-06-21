import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { PaymentController } from './payment.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { RazorpayService } from './razorpay.service';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [PaymentController],
  providers: [StripeService, RazorpayService],
  exports: [StripeService, RazorpayService],
})
export class PaymentModule {}
