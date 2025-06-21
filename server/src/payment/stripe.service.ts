import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCheckoutSessionDto } from './dto/stripe.dto';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY'),
      {
        apiVersion: '2025-04-30.basil',
      },
    );
  }

  async createCheckoutSession(data: CreateCheckoutSessionDto) {
    try {
      const user = await this.prisma.users.findUnique({
        where: { id: data.userId },
        include: {
          credit_transactions: true,
        },
      });
      if (!user) throw new Error('User not found');

      // Create pending transaction first
      const pendingTransaction = await this.prisma.creditTransactions.create({
        data: {
          userId: data.userId,
          amount: data.amount / 100,
          type: 'PURCHASE',
          status: 'PENDING',
          stripeSessionId: null, // Will be updated after session creation
        },
      });

      const session = await this.stripe.checkout.sessions.create({
        mode: 'payment',
        adaptive_pricing: { enabled: true },
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Credits Purchase Heizen',
                description: `${data.amount} Credits`,
              },
              unit_amount: data.amount,
            },
            quantity: 1,
          },
        ],
        metadata: {
          userId: data.userId,
          credits: data.amount / 100,
        },
        success_url: `${this.configService.get<string>('NEXT_PUBLIC_APP_URL')}/dashboard/settings?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${this.configService.get<string>('NEXT_PUBLIC_APP_URL')}/dashboard/settings?canceled=true`,
      });

      // Update transaction with session ID
      await this.prisma.creditTransactions.update({
        where: { id: pendingTransaction.id },
        data: { stripeSessionId: session.id },
      });

      return { url: session.url, sessionId: session.id };
    } catch (error) {
      this.logger.error('Error creating checkout session:', error);
      throw error;
    }
  }

  async verifyPayment(sessionId: string) {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      const transaction = await this.prisma.creditTransactions.findFirst({
        where: { stripeSessionId: sessionId },
      });

      if (!transaction) {
        return { success: false, message: 'Transaction not found' };
      }

      return {
        success: session.payment_status === 'paid',
        credits: transaction.amount * 100,
        status: transaction.status,
      };
    } catch (error) {
      this.logger.error('Error verifying payment:', error);
      throw error;
    }
  }

  async handleWebhook(signature: string, rawBody: Buffer) {
    try {
      console.log('signature', signature);
      console.log('rawBody', rawBody);
      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.configService.get<string>('STRIPE_WEBHOOK_SECRET'),
      );
      switch (event.type) {
        // Handle successful payments
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          await this.handleSuccessfulPayment(session);
          break;
        }
        // Handle failed payments
        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await this.handleFailedPayment(paymentIntent);
          break;
        }
        // Handle expired payments
        case 'checkout.session.expired': {
          const session = event.data.object as Stripe.Checkout.Session;
          await this.handleExpiredPayment(session);
          break;
        }
        // Handle cancelled payments
        case 'payment_intent.canceled': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await this.handleCancelledPayment(paymentIntent);
          break;
        }
        // Handle successful asynchronous payments (e.g., bank transfers)
        case 'checkout.session.async_payment_succeeded': {
          const session = event.data.object as Stripe.Checkout.Session;
          await this.handleSuccessfulPayment(session);
          break;
        }
      }

      return { success: true };
    } catch (error) {
      this.logger.error('Error handling webhook: ' + error);
      throw error;
    }
  }

  private async handleSuccessfulPayment(session: Stripe.Checkout.Session) {
    const userId = session.metadata.userId;
    const credits = parseInt(session.metadata.credits);

    await this.prisma.users.update({
      where: { id: userId },
      data: {
        credits_remaining: {
          increment: credits,
        },
        credit_transactions: {
          updateMany: {
            where: { stripeSessionId: session.id },
            data: { status: 'COMPLETED' },
          },
        },
      },
    });
  }

  private async handleFailedPayment(paymentIntent: Stripe.PaymentIntent) {
    if (!paymentIntent.metadata.sessionId) return;

    await this.prisma.creditTransactions.updateMany({
      where: { stripeSessionId: paymentIntent.metadata.sessionId },
      data: { status: 'FAILED' },
    });
  }

  private async handleExpiredPayment(session: Stripe.Checkout.Session) {
    if (!session.metadata.sessionId) return;

    await this.prisma.creditTransactions.updateMany({
      where: { stripeSessionId: session.metadata.sessionId },
      data: { status: 'EXPIRED' },
    });
  }
  private async handleCancelledPayment(paymentIntent: Stripe.PaymentIntent) {
    if (!paymentIntent.metadata.sessionId) return;

    await this.prisma.creditTransactions.updateMany({
      where: { stripeSessionId: paymentIntent.metadata.sessionId },
      data: { status: 'CANCELLED' },
    });
  }
}
