import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Coins, Plus, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { useUserStore } from '@/stores/useUserStore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { StripeService } from '@/services/stripe.api';
import { toast } from 'sonner';
import { RazorpayService } from '@/services/razorpay.api';
import Script from 'next/script';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

export default function Credits() {
  const { user, fetchUser, isLoading, error, isRefreshing } = useUserStore();
  const [isPurchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [creditAmount, setCreditAmount] = useState('2000');
  const [isProcessing, setIsProcessing] = useState(false);
  const verifyingPayment = useRef(false);

  const verifyPayment = useCallback(
    async (sessionId: string, canceled: string | null) => {
      if (verifyingPayment.current) return;
      verifyingPayment.current = true;
      try {
        if (canceled === 'true') {
          toast.error('Payment Canceled', {
            description: 'Please try again.',
          });
          return;
        }
        const response = await StripeService.verifyPayment(sessionId);
        if (response.success) {
          toast.success('Payment Successful!', {
            description: `${response.credits} credits have been added to your account.`,
          });
          fetchUser();
        }
      } catch {
        toast.error('Error', {
          description: 'Failed to verify payment. Please contact support if credits are not added.',
        });
      } finally {
        window.history.replaceState({}, document.title, window.location.pathname);
        verifyingPayment.current = false;
      }
    },
    [fetchUser],
  );

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const sessionId = searchParams.get('session_id');

    if (success === 'true' && sessionId) {
      verifyPayment(sessionId, canceled);
    }
  }, [verifyPayment]);

  const handleRazorpayPurchaseCredits = async () => {
    try {
      setIsProcessing(true);
      const amount = parseInt(creditAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      if (!user?.id) {
        throw new Error('User not found');
      }

      const response = await RazorpayService.createOrder(user.id, amount);
      if (response.data) {
        setPurchaseModalOpen(false);
        localStorage.setItem('transactionId', response.data.transactionId);
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: response.data.order.amount,
          currency: response.data.order.currency,
          name: 'Heizen Credits',
          description: 'Helix Credits: 100 Credits = 1 USD',
          order_id: response.data.order.id,
          handler: async function (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) {
            const transactionId = localStorage.getItem('transactionId');
            const res = await RazorpayService.verifyPayment({
              transactionId: transactionId ?? '',
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            localStorage.removeItem('transactionId');
            if (res.data) {
              toast.success('Payment Successful!', {
                description: `credits have been added to your account.`,
              });
              fetchUser();
            } else {
              toast.error('Payment Failed!', {
                description: 'Please try again.',
              });
            }
          },
          prefill: {
            name: user.first_name + ' ' + user.last_name,
            email: user.email,
          },
          notes: {
            address: 'Heizen Credits',
          },
        };
        const rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', function () {
          const transactionId = localStorage.getItem('transactionId');
          RazorpayService.markFailedPayment(transactionId ?? '');
          localStorage.removeItem('transactionId');
          toast.error('Payment Failed!', {
            description: 'Please try again.',
          });
        });
        rzp1.open();
      } else {
        toast.error(response.error.message, {
          description: 'Failed to initiate payment. Please try again.',
        });
      }
    } catch {
      toast.error('Error', {
        description: 'Failed to initiate payment. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStripePurchaseCredits = async () => {
    try {
      setIsProcessing(true);
      const amount = parseInt(creditAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      if (!user?.id) {
        throw new Error('User not found');
      }

      const response = await StripeService.createCheckoutSession(user.id, amount);
      window.location.href = response.url;
    } catch {
      toast.error('Error', {
        description: 'Failed to initiate payment. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const totalCredits = (user?.credits_used || 0) + (user?.credits_remaining || 0);
  const usagePercentage = totalCredits > 0 ? ((user?.credits_used || 0) / totalCredits) * 100 : 0;

  if (isLoading) {
    return (
      <Card className="border-none bg-transparent p-2 shadow-none sm:p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-none bg-transparent p-2 shadow-none sm:p-6">
        <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
          <AlertCircle className="text-destructive size-12" />
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Failed to Load Credits</h3>
            <p className="text-muted-foreground text-sm">
              There was an error loading your credit information. Please try again later.
            </p>
          </div>
          <Button onClick={() => fetchUser()} variant="outline" size="sm">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (totalCredits === 0) {
    return (
      <Card className="border-none bg-transparent p-2 shadow-none sm:p-6">
        <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
          <div className="relative">
            <Coins className="text-muted size-12" />
            <Sparkles className="text-primary absolute -top-2 -right-2 size-6 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Get Started with Credits</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Request credits to start using our services.
            </p>
            <Button onClick={() => setPurchaseModalOpen(true)} size={'sm'} className="mt-4 w-full">
              Buy Credits
            </Button>
          </div>
        </div>
        <Dialog open={isPurchaseModalOpen} onOpenChange={setPurchaseModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Purchase Credits</DialogTitle>
              <DialogDescription>Add credits to your account. 100 credit = $1</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount of Credits</label>
                <Input
                  type="number"
                  min="1"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  placeholder="Enter amount"
                />
                <p className="text-muted-foreground text-sm">
                  You will be charged ${parseInt(creditAmount) / 100}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button onClick={handleRazorpayPurchaseCredits} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Purchase with Razorpay'}
              </Button>
              <Button onClick={handleStripePurchaseCredits} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Purchase with Stripe'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-none bg-transparent p-2 shadow-none sm:p-6">
      <Script src="https://checkout.razorpay.com/v1/checkout.js"></Script>

      <div className="relative space-y-6">
        <div className="flex items-center space-x-2">
          <Coins className="text-primary h-5 w-5" />
          <h3 className="text-lg font-semibold">Assistant Credits Usage</h3>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="bg-muted/30 h-full space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                Credits Overview
                <Button
                  onClick={() => fetchUser(true)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  title="Refresh credits"
                >
                  <RefreshCw size={14} className={`${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <span
                className={`text-sm font-medium ${
                  usagePercentage > 70
                    ? 'text-destructive'
                    : usagePercentage > 40
                      ? 'text-yellow-500'
                      : 'text-emerald-500'
                }`}
              >
                {new Intl.NumberFormat().format(user?.credits_remaining || 0)} remaining
              </span>
            </div>

            <div>
              <Progress
                value={usagePercentage}
                className={`h-3 ${
                  usagePercentage > 70
                    ? 'bg-red-500/20 [&>div]:bg-red-500'
                    : usagePercentage > 40
                      ? 'bg-yellow-500/20 [&>div]:bg-yellow-500'
                      : 'bg-emerald-500/20 [&>div]:bg-emerald-500'
                }`}
              />

              <div className="text-muted-foreground mt-2 flex items-center justify-between text-xs">
                <span>
                  Used:{' '}
                  {new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(
                    user?.credits_used || 0,
                  )}
                </span>
                <span>
                  Total:{' '}
                  {new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(
                    totalCredits,
                  )}
                </span>
              </div>

              {usagePercentage > 70 && (
                <p className="text-destructive mt-2 animate-pulse text-xs">Credits running low!</p>
              )}
            </div>
          </div>

          <div className="group bg-sidebar relative flex flex-col justify-between space-y-2 rounded-lg border p-4 transition-all">
            <div>
              <div className="flex items-center gap-2">
                <Plus className="text-primary size-5" />
                <span className="font-medium">Purchase Credits</span>
              </div>
              <p className="text-muted-foreground mt-2 text-sm">
                Add more credits to your account instantly using secure payment.
              </p>
            </div>
            <Button onClick={() => setPurchaseModalOpen(true)} size={'sm'} className="mt-4 w-full">
              Buy Credits
            </Button>
          </div>

          <Dialog open={isPurchaseModalOpen} onOpenChange={setPurchaseModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Purchase Credits</DialogTitle>
                <DialogDescription>Add credits to your account. 100 credit = $1</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount of Credits</label>
                  <Input
                    type="number"
                    min="1"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                  <p className="text-muted-foreground text-sm">
                    You will be charged ${parseInt(creditAmount) / 100}
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button onClick={handleRazorpayPurchaseCredits} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : 'Purchase with Razorpay'}
                </Button>
                <Button onClick={handleStripePurchaseCredits} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : 'Purchase with Stripe'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Card>
  );
}
