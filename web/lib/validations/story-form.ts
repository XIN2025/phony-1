import * as z from 'zod';

export const storyFormSchema = z.object({
  sprintOption: z.enum(['current', 'backlog']),
  storyInput: z.string(),
  files: z.array(z.instanceof(File)).optional(),
});

export type StoryFormValues = z.infer<typeof storyFormSchema>;
