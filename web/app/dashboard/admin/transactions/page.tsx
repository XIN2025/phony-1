'use client';

import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { AdminApi } from '@/services/admin.api';
import { Transaction, TransactionStatus, TransactionType } from '@/types/transaction';
import { getTypeColors, getTransactionStatusColors } from './utils';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [status, setStatus] = useState<TransactionStatus | 'All'>('All');
  const [type, setType] = useState<TransactionType | 'All'>('All');
  const [sortBy, setSortBy] = useState<'createdAt' | 'amount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await AdminApi.getTransactions({
        status: status === 'All' ? undefined : status,
        type: type === 'All' ? undefined : type,
        sortBy,
        sortOrder,
        page,
        limit: 10,
      });
      if (response.data) {
        setTransactions(response.data.transactions);
        setTotalPages(response.data.totalPages);
      } else {
        toast.error('Error fetching transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder, status, type]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSort = (field: 'createdAt' | 'amount') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-2xl font-bold">Transactions</h1>

      <Card className="border-none bg-transparent p-0 shadow-none">
        <div className="mb-6 flex gap-4">
          <Select
            value={status}
            onValueChange={(value: TransactionStatus | 'All') => setStatus(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              {Object.values(TransactionStatus).map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={type} onValueChange={(value: TransactionType | 'All') => setType(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              {Object.values(TransactionType).map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('amount')}
                    className="flex items-center gap-1"
                  >
                    Amount
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('createdAt')}
                    className="flex items-center gap-1"
                  >
                    Date
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {transaction.user.first_name} {transaction.user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{transaction.user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">${transaction.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getTypeColors(transaction.type)}`}
                      >
                        {transaction.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{transaction.platform ?? 'STRIPE'}</Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getTransactionStatusColors(transaction.status)}`}
                      >
                        {transaction.status}
                      </span>
                    </TableCell>
                    <TableCell>{format(new Date(transaction.createdAt), 'MMM d, yyyy')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
