'use client';
import { ReactNode } from 'react';
import { FeatureFlag, useFeatureFlag } from '@/hooks/useFeatureFlags';

interface FeatureFlagWrapperProps {
  flag: FeatureFlag;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * A component that conditionally renders its children based on a feature flag
 * @param flag The feature flag to check
 * @param children The content to render if the feature flag is enabled
 * @param fallback Optional content to render if the feature flag is disabled
 */
export const FeatureFlagWrapper = ({ flag, children, fallback }: FeatureFlagWrapperProps) => {
  const isEnabled = useFeatureFlag(flag);

  if (!isEnabled) {
    return fallback || null;
  }

  return <>{children}</>;
};
