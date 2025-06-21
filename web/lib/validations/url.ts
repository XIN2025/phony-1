import { z } from 'zod';

export const urlSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, 'URL is required')
    .url('Please enter a valid URL')
    .refine((url) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    }, 'Invalid URL format')
    .refine((url) => {
      try {
        const protocol = new URL(url).protocol;
        return protocol === 'http:' || protocol === 'https:';
      } catch {
        return false;
      }
    }, 'URL must start with http:// or https://'),
});

export type UrlSchemaType = z.infer<typeof urlSchema>;
