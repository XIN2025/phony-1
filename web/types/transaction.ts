export enum TransactionType {
  PURCHASE = 'PURCHASE',
  REFUND = 'REFUND',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  stripeSessionId?: string;
  razorpayOrderId?: string;
  currency?: string;
  platform?: 'STRIPE' | 'RAZORPAY';
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
}
