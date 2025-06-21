import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Coins, Mail, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { useUserStore } from '@/stores/useUserStore';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function MeetingCredits() {
  const { user, fetchUser, isLoading, error, isRefreshing } = useUserStore();

  const totalCredits = (user?.meeting_credits_used || 0) + (user?.meeting_credits_remaining || 0);
  const usagePercentage =
    totalCredits > 0 ? ((user?.meeting_credits_used || 0) / totalCredits) * 100 : 0;

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
            <p className="text-muted-foreground text-sm">
              Contact us at{' '}
              <a href="mailto:admin@heizen.work" className="text-primary hover:underline">
                admin@heizen.work
              </a>{' '}
              to purchase credits and start using our services.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-none bg-transparent p-2 shadow-none sm:p-6">
      <div className="relative space-y-6">
        <div className="flex items-center space-x-2">
          <Coins className="text-primary h-5 w-5" />
          <h3 className="text-lg font-semibold">PM Agent Meeting Credits Usage</h3>
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
                {new Intl.NumberFormat().format(user?.meeting_credits_remaining || 0)} remaining
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
                <span>Used: {new Intl.NumberFormat().format(user?.meeting_credits_used || 0)}</span>
                <span>Total: {new Intl.NumberFormat().format(totalCredits)}</span>
              </div>

              {usagePercentage > 70 && (
                <p className="text-destructive mt-2 animate-pulse text-xs">Credits running low!</p>
              )}
            </div>
          </div>

          <div className="group bg-sidebar relative flex flex-col justify-center space-y-2 rounded-lg border p-4 transition-all">
            <div className="flex items-center gap-2">
              <Mail className="text-primary size-5" />
              <span className="font-medium">Need More Credits?</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Contact us at{' '}
              <a href="mailto:admin@heizen.work" className="text-primary hover:underline">
                admin@heizen.work
              </a>{' '}
              to discuss your credit requirements.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
