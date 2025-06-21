'use client';
import { useSession } from 'next-auth/react';
import LoadingScreen from '@/components/LoadingScreen';
import { Separator } from '@/components/ui/separator';
import GithubSettings from '@/components/dashboard/settings/Github';
import Credits from '@/components/dashboard/settings/Credits';
import UserProfile from '@/components/dashboard/settings/UserProfile';
import { FeatureFlagWrapper } from '@/components/FeatureFlagWrapper';
import { FeatureFlag } from '@/hooks/useFeatureFlags';
import MeetingCredits from '@/components/dashboard/settings/MeetingsCredits';
import ChangePassword from '@/components/dashboard/settings/ChangePassword';

export default function SettingsPage() {
  const { status } = useSession();

  if (status === 'loading') {
    return <LoadingScreen type="logo" />;
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4">
      <UserProfile />
      <Separator />
      <FeatureFlagWrapper flag={FeatureFlag.DEVELOPMENT}>
        <Credits />
        <Separator />
        <GithubSettings />
        <Separator />
      </FeatureFlagWrapper>
      <MeetingCredits />
      <Separator />
      <ChangePassword />
      <Separator />
    </div>
  );
}
