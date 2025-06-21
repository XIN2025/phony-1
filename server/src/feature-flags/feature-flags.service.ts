import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PostHog } from 'posthog-node';
import { DEFAULT_FEATURE_FLAGS } from './feature-flags.constants';

@Injectable()
export class FeatureFlagsService {
  private readonly logger = new Logger(FeatureFlagsService.name);
  private readonly posthog: PostHog;
  private readonly usePostHog: boolean;
  private readonly globalFlags: Map<string, boolean> = new Map();

  constructor(private readonly configService: ConfigService) {
    const posthogApiKey = this.configService.get<string>(
      'NEXT_PUBLIC_POSTHOG_KEY',
    );
    const posthogHost = this.configService.get<string>(
      'NEXT_PUBLIC_POSTHOG_HOST',
      'https://us.i.posthog.com',
    );

    this.usePostHog = !!posthogApiKey;

    if (!this.usePostHog) {
      this.logger.warn(
        'PostHog API key not found. Using default feature flag values.',
      );
      // Initialize with default values
      Object.entries(DEFAULT_FEATURE_FLAGS).forEach(([key, value]) => {
        this.globalFlags.set(key, value);
      });
    } else {
      this.posthog = new PostHog(posthogApiKey, {
        host: posthogHost,
      });
    }
  }

  /**
   * Check if a feature flag is enabled globally
   * @param flagKey The feature flag key
   * @param defaultValue The default value if the flag is not found
   * @returns Whether the feature flag is enabled
   */
  async isFeatureEnabled(
    flagKey: string,
    defaultValue = false,
  ): Promise<boolean> {
    try {
      // If we're not using PostHog, check the local map
      if (!this.usePostHog) {
        return this.globalFlags.get(flagKey) ?? defaultValue;
      }

      // For PostHog, we'll use a consistent distinct ID for global flags
      // This allows us to use PostHog's UI to manage flags
      const globalDistinctId = 'global-flags';
      const isEnabled = await this.posthog.isFeatureEnabled(
        flagKey,
        globalDistinctId,
      );
      return isEnabled ?? defaultValue;
    } catch (error) {
      this.logger.error(
        `Error checking feature flag ${flagKey}: ${error.message}`,
      );
      return defaultValue;
    }
  }

  /**
   * Get all feature flags
   * @returns An object with all feature flags and their values
   */
  async getAllFeatureFlags(): Promise<Record<string, any>> {
    try {
      // If we're not using PostHog, return the local map
      if (!this.usePostHog) {
        return Object.fromEntries(this.globalFlags);
      }

      // For PostHog, use a consistent distinct ID for global flags
      const globalDistinctId = 'global-flags';
      const flags = await this.posthog.getAllFlags(globalDistinctId);
      return flags || {};
    } catch (error) {
      this.logger.error(`Error getting all feature flags: ${error.message}`);
      return {};
    }
  }

  /**
   * Set a feature flag value locally (only used when PostHog is not available)
   * @param flagKey The feature flag key
   * @param value The value to set
   */
  setFeatureFlag(flagKey: string, value: boolean): void {
    if (this.usePostHog) {
      this.logger.warn(
        'Setting feature flags locally is not supported when PostHog is enabled. Use PostHog UI instead.',
      );
      return;
    }

    this.globalFlags.set(flagKey, value);
  }
}
