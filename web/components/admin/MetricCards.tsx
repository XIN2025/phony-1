import { Card } from '@/components/ui/card';
import { DashboardStatsResponse } from '@/types/admin';
import { formatNumber } from '@/utils/numberFormat';

interface MetricCardsProps {
  stats: DashboardStatsResponse;
}

export function MetricCards({ stats }: MetricCardsProps) {
  const creditUtilization =
    (stats.overview.totalCreditsUsed /
      (stats.overview.totalCredits + stats.overview.totalCreditsUsed)) *
    100;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard label="Total Users" value={formatNumber(stats.overview.totalUsers)} />
      <MetricCard
        label="Available Credits"
        value={`$${formatNumber(stats.overview.totalCredits)}`}
      />
      <MetricCard
        label="Credits Used"
        value={`$${formatNumber(stats.overview.totalCreditsUsed)}`}
        subtext={`${creditUtilization.toFixed(1)}% utilization`}
      />
      <MetricCard
        label="Waitlist"
        value={formatNumber(stats.overview.waitlistCounts.pending)}
        subtext={`${stats.overview.waitlistCounts.approved} approved`}
      />
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  subtext?: string;
}

function MetricCard({ label, value, subtext }: MetricCardProps) {
  return (
    <Card className="p-4">
      <div className="flex flex-col">
        <span className="text-muted-foreground text-sm font-medium">{label}</span>
        <span className="mt-2 text-2xl font-semibold">{value}</span>
        {subtext && <span className="text-muted-foreground mt-1 text-sm">{subtext}</span>}
      </div>
    </Card>
  );
}
