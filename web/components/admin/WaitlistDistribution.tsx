import { Card } from '@/components/ui/card';
import { formatNumber } from '@/utils/numberFormat';

interface WaitlistDistributionProps {
  waitlistCounts: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

export function WaitlistDistribution({ waitlistCounts }: WaitlistDistributionProps) {
  const total = waitlistCounts.pending + waitlistCounts.approved + waitlistCounts.rejected;

  return (
    <Card className="p-4">
      <h2 className="mb-4 text-lg font-semibold">Waitlist Distribution</h2>
      <div className="space-y-4">
        <ProgressBar
          label="Pending Applications"
          value={waitlistCounts.pending}
          total={total}
          color="bg-yellow-500"
        />
        <ProgressBar
          label="Approved"
          value={waitlistCounts.approved}
          total={total}
          color="bg-green-500"
        />
        <ProgressBar
          label="Rejected"
          value={waitlistCounts.rejected}
          total={total}
          color="bg-red-500"
        />
      </div>
    </Card>
  );
}

interface ProgressBarProps {
  label: string;
  value: number;
  total: number;
  color: string;
}

function ProgressBar({ label, value, total, color }: ProgressBarProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">{label}</p>
        <div className="bg-muted h-2 overflow-hidden rounded-full">
          <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
        </div>
      </div>
      <span className="ml-4 font-medium">{formatNumber(value)}</span>
    </div>
  );
}
