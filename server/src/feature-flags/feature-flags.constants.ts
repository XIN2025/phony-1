/**
 * Feature flag keys used throughout the application
 */
export enum FeatureFlag {
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
 * Default values for feature flags when PostHog is not available
 */
export const DEFAULT_FEATURE_FLAGS: Record<FeatureFlag, boolean> = {
  [FeatureFlag.DEPLOYMENT]: false,
  [FeatureFlag.TESTING]: false,
  [FeatureFlag.DEVELOPMENT]: false,
  [FeatureFlag.REQUIREMENT]: true,
  [FeatureFlag.MEETING]: true,
  [FeatureFlag.RESOURCES]: true,
  [FeatureFlag.SECRETS]: false,
  [FeatureFlag.DESIGN_AGENT]: false,
  [FeatureFlag.CLIENT_DASHBOARD]: false,
  [FeatureFlag.IS_WAITLIST_NEEDED]: true,
  // Add more default values here as needed
};
