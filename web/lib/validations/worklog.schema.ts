import { z } from 'zod';

export const addWorklogSchema = z
  .object({
    hoursWorked: z
      .number()
      .min(0.1, 'Hours worked must be at least 0.1')
      .max(24, 'Hours worked cannot exceed 24'),
    description: z.string().optional(),
    date: z.string().min(1, 'Date is required'),
    type: z.enum(['bug', 'story', 'wiki', 'meeting'], {
      required_error: 'Please select a type',
    }),
    bugId: z.string().optional(),
    storyId: z.string().optional(),
    meetingId: z.string().optional(),
    wikiId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === 'bug' && !data.bugId) return false;
      if (data.type === 'story' && !data.storyId) return false;
      if (data.type === 'wiki' && !data.wikiId) return false;
      if (data.type === 'meeting' && !data.meetingId) return false;
      return true;
    },
    {
      message: 'Please select an item for the chosen type',
    },
  );

export type AddWorklogFormData = z.infer<typeof addWorklogSchema>;
