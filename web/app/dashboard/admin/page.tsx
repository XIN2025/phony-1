'use client';

import { useEffect, useState } from 'react';
import { AdminApi } from '@/services/admin.api';
import { DashboardStatsResponse } from '@/types/admin';
import { LoadingSpinner } from '@/components/admin/LoadingSpinner';
import { ErrorDisplay } from '@/components/admin/ErrorDisplay';
import { MetricCards } from '@/components/admin/MetricCards';
import { WaitlistDistribution } from '@/components/admin/WaitlistDistribution';
import { CreditDistribution } from '@/components/admin/CreditDistribution';
import UserCreditsPage from '@/components/admin/UserCreditsPage';
import { LayoutDashboard } from 'lucide-react';
import { AdminNav } from '@/components/AdminNav';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await AdminApi.getDashboardStats();
        if (response.data) {
          setStats(response.data);
        } else {
          toast.error(response.error.message);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!stats) return <ErrorDisplay />;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <LayoutDashboard className="text-primary h-5 w-5" />
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
        </div>
        <p className="text-muted-foreground text-sm">Manage all your about your users</p>
      </div>
      <AdminNav />
      <MetricCards stats={stats} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WaitlistDistribution waitlistCounts={stats.overview.waitlistCounts} />
        <CreditDistribution
          totalCredits={stats.overview.totalCredits}
          totalCreditsUsed={stats.overview.totalCreditsUsed}
        />
      </div>
      <UserCreditsPage />
    </div>
  );
}
