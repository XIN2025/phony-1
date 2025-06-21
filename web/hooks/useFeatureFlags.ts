import { useFeatureFlagStore } from '@/stores/useFeatureFlagStore';

/**
 * Feature flag keys used throughout the application
 */
export enum FeatureFlag {
  // steps
  DEPLOYMENT = 'deployment',
  TESTING = 'testing',
  DEVELOPMENT = 'development',
  REQUIREMENT = 'requirement',
  // project pages
  MEETING = 'meeting',
  RESOURCES = 'resources',
  SECRETS = 'secrets',
  DESIGN_AGENT = 'design_agent',
  // pages
  CLIENT_DASHBOARD = 'client_dashboard',
  IS_WAITLIST_NEEDED = 'is_waitlist_needed',
}

/**
 * Hook to check if a feature flag is enabled
 * @param flag The feature flag to check
 * @returns Whether the feature flag is enabled
 */
export const useFeatureFlag = (flag: FeatureFlag | string): boolean => {
  const { isEnabled, isUserApproved } = useFeatureFlagStore();
  return isUserApproved || isEnabled(flag);
};

/**
 * Hook to get all active feature flags
 * @returns Array of active feature flags
 */
export const useActiveFeatureFlags = (): string[] => {
  return useFeatureFlagStore((state) => state.activeFlags);
};
