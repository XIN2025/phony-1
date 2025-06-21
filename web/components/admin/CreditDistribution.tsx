import { Card } from '@/components/ui/card';
import { formatNumber } from '@/utils/numberFormat';

interface CreditDistributionProps {
  totalCredits: number;
  totalCreditsUsed: number;
}

export function CreditDistribution({ totalCredits, totalCreditsUsed }: CreditDistributionProps) {
  const creditUtilization = (totalCreditsUsed / (totalCredits + totalCreditsUsed)) * 100;

  return (
    <Card className="p-4">
      <h2 className="mb-4 text-lg font-semibold">Credit Distribution</h2>
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="bg-muted h-3 overflow-hidden rounded-full">
            <div className="bg-primary h-full" style={{ width: `${creditUtilization}%` }} />
          </div>
          <div className="mt-3 flex justify-between text-sm">
            <span>Used: ${formatNumber(totalCreditsUsed)}</span>
            <span>Available: ${formatNumber(totalCredits)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
