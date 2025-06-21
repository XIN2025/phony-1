import { ResourceFormData } from './ResourceDialog';
import { z } from 'zod';

export const generateCronExpression = (data: ResourceFormData): string | null => {
  if (data.scheduleType === 'none' || !data.scheduleTime) {
    return null;
  }

  // Parse the time and subtract 5 minutes
  let [hours, minutes] = data.scheduleTime.split(':').map(Number);
  let totalMinutes = hours * 60 + minutes - 5;

  // Handle negative minutes by adjusting hours
  if (totalMinutes < 0) {
    totalMinutes += 24 * 60; // Add 24 hours worth of minutes
  }

  // Convert back to hours and minutes
  hours = Math.floor(totalMinutes / 60);
  minutes = totalMinutes % 60;

  if (data.scheduleType === 'daily' && data.scheduleDate) {
    // For daily checks, we use * for days since it runs every day
    // (Min) (Hr) (Day of Month) (Month) (Day of Week) (Year)
    return `${minutes} ${hours} * * ? *`;
  }

  if (data.scheduleType === 'recurring' && data.scheduleDays?.length) {
    // Sort days and return them as a comma-separated string
    const cronDays = data.scheduleDays
      .sort((a, b) => {
        const dayOrder: Record<string, number> = {
          SUN: 0,
          MON: 1,
          TUE: 2,
          WED: 3,
          THU: 4,
          FRI: 5,
          SAT: 6,
        };
        return dayOrder[a] - dayOrder[b];
      })
      .join(',');
    return `${minutes} ${hours} ? * ${cronDays} *`;
  }

  return null;
};
export const DAYS_OF_WEEK = [
  { value: 'MON', label: 'Monday' },
  { value: 'TUE', label: 'Tuesday' },
  { value: 'WED', label: 'Wednesday' },
  { value: 'THU', label: 'Thursday' },
  { value: 'FRI', label: 'Friday' },
  { value: 'SAT', label: 'Saturday' },
  { value: 'SUN', label: 'Sunday' },
];

export const resourceFormSchema = z
  .object({
    resourceName: z.string().min(1, 'Name is required'),
    resourceURL: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    resourceType: z.enum([
      'document',
      'figma',
      'video',
      'reference',
      'meeting',
      'repository',
      'other',
    ] as const),
    scheduleType: z.enum(['none', 'daily', 'recurring']),
    scheduleTime: z.string().refine(
      (val) => {
        if (val === '') return true;
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val);
      },
      { message: 'Please enter a valid time in HH:MM format' },
    ),
    scheduleDays: z.array(z.string()),
    scheduleDate: z.date().optional(),
    projectId: z.string(),
  })
  .superRefine((data, ctx) => {
    if (
      data.resourceType !== 'document' &&
      data.resourceType !== 'reference' &&
      !data.resourceURL
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'URL is required',
        path: ['resourceURL'],
      });
    }
    if (data.scheduleType === 'daily') {
      if (!data.scheduleTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Time is required for daily schedule',
          path: ['scheduleTime'],
        });
      }
      if (!data.scheduleDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Start date is required for daily schedule',
          path: ['scheduleDate'],
        });
      }
    }
    if (data.scheduleType === 'recurring') {
      if (!data.scheduleTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Time is required for recurring schedule',
          path: ['scheduleTime'],
        });
      }
      if (data.scheduleDays.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please select at least one day',
          path: ['scheduleDays'],
        });
      }
    }
  });
