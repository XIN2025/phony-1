import { z } from 'zod';

export const feedbackFormSchema = z.object({
  textFeedback: z.string().optional(),
  screenshots: z
    .array(z.instanceof(File))
    .max(3, { message: 'You can only upload up to 3 screenshots' })
    .optional(),
  voiceFeedback: z.instanceof(Blob).optional().nullable(),
});

export type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;
