import { ModelType } from '../enums/ModelType.enum';
// utils/getTimezoneOffset.ts

/**
 * Returns the offset in minutes between the given IANA timezone and UTC.
 * @param timezone - IANA timezone string (e.g., "America/New_York")
 * @param date - Optional date (defaults to now)
 * @returns Offset in minutes from UTC (positive if ahead, negative if behind)
 */
export function getTimezoneOffset(
  timezone: string,
  date: Date = new Date(),
): number {
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const localDate = new Date(
    date.toLocaleString('en-US', { timeZone: timezone }),
  );
  // Offset in milliseconds
  const offsetMs = localDate.getTime() - utcDate.getTime();
  // Convert to minutes
  return Math.round(offsetMs / (1000 * 60));
}

export function getModelType(modelType: string) {
  switch (modelType) {
    case 'gpt-4o':
      return ModelType.GPT_4O;
    case 'o3-mini':
      return ModelType.O3_MINI;
    case 'deepseek-chat':
      return ModelType.DEEPSEEK_CHAT;
    case 'deepseek-reasoner':
      return ModelType.DEEPSEEK_REASONER;
    case 'gemini-2.0-flash':
      return ModelType.GEMINI_2_0_FLASH;
    default:
      return ModelType.GPT_4O;
  }
}

export async function retryApiCall<T>(
  func: () => Promise<T>,
  maxAttempts: number = 3,
): Promise<T> {
  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      return await func();
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) {
        throw error;
      }
      console.log('Retrying...');
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempts) * 1000),
      );
    }
  }
  throw new Error(`Failed after ${maxAttempts} attempts`);
}
