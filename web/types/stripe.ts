export interface CheckoutResponse {
  url: string;
  sessionId: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  credits?: number;
  message?: string;
}
