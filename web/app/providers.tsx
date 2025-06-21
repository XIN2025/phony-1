'use client';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SessionProvider, useSession } from 'next-auth/react';
import { Toaster } from '@/components/ui/sonner';
import { GithubProvider } from '@/contexts/github.context';
import { useEffect } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider, useActiveFeatureFlags, usePostHog } from 'posthog-js/react';
import { useFeatureFlagStore } from '@/stores/useFeatureFlagStore';
import dynamic from 'next/dynamic';
import LoadingScreen from '@/components/LoadingScreen';

const PostHogPageView = dynamic(() => import('./PostHogPageView'), {
  ssr: false,
});

// Component to fetch and store active feature flags
const FeatureFlagInitializer = ({ children }: { children: React.ReactNode }) => {
  const activeFlags = useActiveFeatureFlags();
  const { data: session } = useSession();
  const posthog = usePostHog();
  const { setActiveFlags, refreshUserApprovalStatus, setLoadingFlags, loadingFlags } =
    useFeatureFlagStore();

  useEffect(() => {
    if (activeFlags) {
      setActiveFlags(activeFlags);
      setLoadingFlags(false);
    }
  }, [activeFlags, setActiveFlags, setLoadingFlags]);

  useEffect(() => {
    if (session?.user?.email) {
      refreshUserApprovalStatus();
      posthog.identify(session.user.email);
    }
  }, [session?.user?.email, posthog, refreshUserApprovalStatus]);

  if (loadingFlags) {
    return (
      <div className="h-dvh">
        <LoadingScreen type="logo" />
      </div>
    );
  }

  return <>{children}</>;
};

const Providers = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || '', {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      ui_host: 'us.posthog.com',
      capture_pageview: true,
      capture_pageleave: true,
    });
  }, []);
  return (
    <SessionProvider>
      <PHProvider client={posthog}>
        <PostHogPageView />
        <FeatureFlagInitializer>
          <GithubProvider>
            <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
              <Toaster richColors closeButton position="top-right" />
              <TooltipProvider>{children}</TooltipProvider>
            </ThemeProvider>
          </GithubProvider>
        </FeatureFlagInitializer>
      </PHProvider>
    </SessionProvider>
  );
};

export default Providers;
