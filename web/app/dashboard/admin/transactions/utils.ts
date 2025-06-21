import { TransactionType } from '@/types/transaction';

import { TransactionStatus } from '@/types/transaction';

export const getTypeColors = (type: TransactionType) => {
  switch (type) {
    case TransactionType.PURCHASE:
      return 'bg-green-500/10 hover:bg-green-500/20 text-green-500';
    case TransactionType.REFUND:
      return 'bg-red-500/10 hover:bg-red-500/20 text-red-500';
    default:
      return 'bg-gray-500/10 hover:bg-gray-500/20 text-gray-500';
  }
};

export const getTransactionStatusColors = (status: TransactionStatus) => {
  switch (status) {
    case TransactionStatus.COMPLETED:
      return 'bg-green-500/10 hover:bg-green-500/20 text-green-500';
    case TransactionStatus.PENDING:
      return 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-500';
    case TransactionStatus.FAILED:
      return 'bg-red-500/10 hover:bg-red-500/20 text-red-500';
    case TransactionStatus.EXPIRED:
      return 'bg-gray-500/10 hover:bg-gray-500/20 text-gray-500';
    case TransactionStatus.CANCELLED:
      return 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500';
    default:
      return 'bg-gray-500/10 hover:bg-gray-500/20 text-gray-500';
  }
};
