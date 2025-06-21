import { getApiInstance } from '@/utils/api';
import { isAxiosError } from 'axios';
import { CheckoutResponse, VerifyPaymentResponse } from '@/types/stripe';

export class StripeService {
  /**
   * Creates a checkout session for credit purchase
   * @param userId - The ID of the user
   * @param amount - The amount of credits to purchase
   * @returns The checkout URL and session ID
   */
  static async createCheckoutSession(userId: string, amount: number) {
    const api = await getApiInstance();
    try {
      const response = await api.post('stripe/create-checkout-session', {
        userId,
        amount,
      });
      return response.data as CheckoutResponse;
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error.response?.data);
        throw error.response?.data;
      } else {
        console.log(error);
        throw error;
      }
    }
  }

  /**
   * Verifies a payment after successful checkout
   * @param sessionId - The ID of the checkout session
   * @returns The verification result with credits added
   */
  static async verifyPayment(sessionId: string) {
    const api = await getApiInstance();
    try {
      const response = await api.get(`stripe/verify-payment?session_id=${sessionId}`);
      return response.data as VerifyPaymentResponse;
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error.response?.data);
        throw error.response?.data;
      } else {
        console.log(error);
        throw error;
      }
    }
  }
}
