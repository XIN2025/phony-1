'use client';

import { useSession } from 'next-auth/react';
import { UserCreditsTable } from '@/components/admin/UserCreditsTable';
import { Card } from '@/components/ui/card';
import { Coins } from 'lucide-react';

export default function UserCreditsPage() {
  const { status } = useSession();

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-6xl py-10">
        <div className="flex animate-pulse flex-col gap-6">
          <div>
            <div className="bg-muted h-8 w-48 rounded" />
            <div className="bg-muted mt-2 h-4 w-96 rounded" />
          </div>
          <Card className="p-6">
            <div className="space-y-4">
              <div className="bg-muted h-10 rounded" />
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-muted h-16 rounded" />
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl py-10">
      <div className="flex flex-col gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Coins className="text-primary h-5 w-5" />
            <h1 className="text-lg font-semibold">Credits Management</h1>
          </div>
          <p className="text-muted-foreground text-sm">Manage all users Credits</p>
        </div>

        <UserCreditsTable />
      </div>
    </div>
  );
}
