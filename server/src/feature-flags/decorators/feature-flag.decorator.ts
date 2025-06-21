import { FeatureFlagsService } from '../feature-flags.service';

export const FEATURE_FLAG_KEY = 'featureFlag';

export interface FeatureFlagOptions {
  name: string;
  throwError?: boolean;
  defaultValue?: any;
}

export function RequireFeatureFlag(options: string | FeatureFlagOptions) {
  const flagOptions: FeatureFlagOptions =
    typeof options === 'string'
      ? { name: options, throwError: false, defaultValue: null }
      : { throwError: false, defaultValue: null, ...options };

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const featureFlagsService = this
        .featureFlagsService as FeatureFlagsService;

      if (!featureFlagsService) {
        throw new Error('FeatureFlagsService must be injected in the class');
      }

      const isEnabled = await featureFlagsService.isFeatureEnabled(
        flagOptions.name,
      );

      if (!isEnabled) {
        if (flagOptions.throwError) {
          throw new Error(`Feature '${flagOptions.name}' is not enabled`);
        }
        return flagOptions.defaultValue;
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
