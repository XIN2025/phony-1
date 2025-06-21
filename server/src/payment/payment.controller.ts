import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from './stripe.service';
import { CreateCheckoutSessionDto } from './dto/stripe.dto';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RazorpayService } from './razorpay.service';
import { VerifyRazorPayPaymentDto } from './dto/razorpay.dto';

@Controller()
export class PaymentController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly razorpayService: RazorpayService,
  ) {}

  @UseGuards(JWTAuthGuard)
  @Post('stripe/create-checkout-session')
  async createCheckoutSession(@Body() data: CreateCheckoutSessionDto) {
    return this.stripeService.createCheckoutSession(data);
  }

  @UseGuards(JWTAuthGuard)
  @Get('stripe/verify-payment')
  async verifyPayment(@Query('session_id') sessionId: string) {
    return this.stripeService.verifyPayment(sessionId);
  }

  @Post('stripe/webhook')
  async handleWebhook(@Req() request: RawBodyRequest<Request>) {
    return this.stripeService.handleWebhook(
      request.headers['stripe-signature'] as string,
      request.rawBody,
    );
  }

  @Post('razorpay/create-order')
  async createOrder(@Body() data: CreateCheckoutSessionDto) {
    return this.razorpayService.createOrder(data);
  }

  @Post('razorpay/verify-payment')
  async verifyRazorPayPayment(@Body() data: VerifyRazorPayPaymentDto) {
    return this.razorpayService.verifyPayment(data);
  }

  @Post('razorpay/mark-failed-payment/:transactionId')
  async markFailedPayment(@Param('transactionId') transactionId: string) {
    return this.razorpayService.markFailedPayment(transactionId);
  }
}
