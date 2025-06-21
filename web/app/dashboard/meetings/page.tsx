import React from 'react';
import { WaitlistService } from '@/services';
import { authOptions } from '@/auth';
import { FeatureFlag } from '@/hooks/useFeatureFlags';
import { posthogClient } from '@/lib/posthog';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import GlobalMeetingsPage from '@/components/dashboard/meeting-data/GlobalMeetingsPage';

const Page = async () => {
  const session = await getServerSession(authOptions);
  const isEnabled = await posthogClient.isFeatureEnabled(
    FeatureFlag.MEETING,
    session?.user?.email ?? 'anonymous',
  );
  try {
    const isUserApproved = await WaitlistService.isUserApproved();
    if (!isEnabled && !isUserApproved.data) {
      return notFound();
    }
  } catch {
    notFound();
  }
  return <GlobalMeetingsPage />;
};

export default Page;
