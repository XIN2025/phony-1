import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCheckoutSessionDto } from './dto/stripe.dto';
import Razorpay from 'razorpay';
import { Orders } from 'razorpay/dist/types/orders';
import { VerifyRazorPayPaymentDto } from './dto/razorpay.dto';

@Injectable()
export class RazorpayService {
  private instance: Razorpay;
  constructor(private readonly prisma: PrismaService) {
    this.instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  async createOrder(data: CreateCheckoutSessionDto) {
    try {
      const user = await this.prisma.users.findUnique({
        where: { id: data.userId },
        include: {
          credit_transactions: true,
        },
      });
      if (!user)
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);

      const pendingTransaction = await this.prisma.creditTransactions.create({
        data: {
          userId: data.userId,
          amount: data.amount / 100,
          platform: 'RAZORPAY',
          type: 'PURCHASE',
          status: 'PENDING',
          stripeSessionId: null,
          razorpayOrderId: null,
        },
      });

      const order: Orders.RazorpayOrder = await this.instance.orders.create({
        amount: data.amount * 85,
        currency: 'INR',
        receipt: `receipt_${new Date().toISOString()}`,
      });

      await this.prisma.creditTransactions.update({
        where: { id: pendingTransaction.id },
        data: { razorpayOrderId: order.id },
      });

      return {
        order,
        transactionId: pendingTransaction.id,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async verifyPayment(data: VerifyRazorPayPaymentDto) {
    try {
      const order = await this.instance.orders.fetch(data.razorpay_order_id);
      if (order.status === 'paid') {
        const transaction = await this.prisma.creditTransactions.update({
          where: { id: data.transactionId },
          data: { status: 'COMPLETED' },
        });
        await this.prisma.users.update({
          where: { id: transaction.userId },
          data: {
            credits_remaining: { increment: transaction.amount },
          },
        });
        return true;
      }
      return false;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async markFailedPayment(transactionId: string) {
    await this.prisma.creditTransactions.update({
      where: { id: transactionId },
      data: { status: 'FAILED' },
    });
  }
}
