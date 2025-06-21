'use client';

import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormLabel,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ScreenshotUpload } from './ScreenshotUpload';
import { VoiceUpload } from './VoiceUpload';
import { feedbackFormSchema, FeedbackFormValues } from './schema';
import { useState } from 'react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { BugsService } from '@/services/bugs.api';
import { isAxiosError } from 'axios';

type BugFormProps = {
  projectId: string;
  onCreated: () => void;
};

export function BugForm({ projectId, onCreated }: BugFormProps) {
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      textFeedback: '',
      screenshots: [],
      voiceFeedback: undefined,
    },
  });
  const [submitting, setSubmitting] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);

  const data = form.watch();

  const hasContent = () => {
    return (
      (data.textFeedback && data.textFeedback.trim().length > 0) ||
      (data.screenshots && data.screenshots.length > 0) ||
      data.voiceFeedback !== undefined
    );
  };

  const onSubmit = async (data: FeedbackFormValues) => {
    try {
      setSubmitting(true);
      const formData = new FormData();
      if (data.textFeedback) {
        formData.append('textFeedback', data.textFeedback);
      }
      data.screenshots?.forEach((screenshot) => {
        formData.append('screenshots', screenshot);
      });
      if (data.voiceFeedback) {
        formData.append('voiceFeedback', data.voiceFeedback);
      }
      formData.append('projectId', projectId);
      const res = await BugsService.createBug(formData);
      if (res.data) {
        toast.success('Bug Created Successfully', {
          duration: 2000,
        });
      } else {
        toast.error(res.error?.message);
      }
      onCreated();
      form.reset();
      setResetTrigger((prev) => prev + 1);
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message, {
          description: 'Please try again',
        });
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to submit feedback');
      }
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="bg-background w-full border-none p-0 shadow-none">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="textFeedback"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Write your thoughts</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Please provide your feedback here..."
                    className="min-h-[100px] resize-none max-sm:text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <ScreenshotUpload form={form} resetTrigger={resetTrigger} />
          <VoiceUpload form={form} resetTrigger={resetTrigger} />

          <Button type="submit" className="w-full" disabled={!hasContent() || submitting}>
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </form>
      </Form>
    </Card>
  );
}
