import { ApiClient } from '@/lib/api-client';
import { RazorpayOrderResponse } from '@/types/razorpay';

export class RazorpayService {
  static async createOrder(userId: string, amount: number) {
    return ApiClient.post<RazorpayOrderResponse>('/razorpay/create-order', {
      userId,
      amount,
    });
  }

  static async verifyPayment(data: {
    transactionId: string;
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) {
    return ApiClient.post<boolean>('/razorpay/verify-payment', {
      ...data,
    });
  }

  static async markFailedPayment(transactionId: string) {
    return ApiClient.post<boolean>(`/razorpay/mark-failed-payment/${transactionId}`);
  }
}
