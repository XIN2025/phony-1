export type RazorpayOrderResponse = {
  order: Order;
  transactionId: string;
};

type Order = {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  offer_id: string | null;
  status: 'created' | 'attempted' | 'paid';
  attempts: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  notes: Record<string, any>;
  created_at: number;
};
