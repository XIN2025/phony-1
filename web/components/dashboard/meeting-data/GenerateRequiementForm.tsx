import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { FileUploader } from '@/components/ui/file-uploader';
import { Button } from '@/components/ui/button';
import type { Project } from '@/types/project';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { storyFormSchema, type StoryFormValues } from '@/lib/validations/story-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ListPlus, Loader2 } from 'lucide-react';
import MdxEditorComponent from '@/components/MdxEditor';
import { cn } from '@/lib/utils';

type GenerateStoriesFormProps = {
  project: Project;
  onSubmit: (formData: StoryFormValues) => Promise<void>;
  onCancel: () => void;
  initialValues?: Partial<StoryFormValues>;
};

const SprintOptionCard = ({
  title,
  description,
  icon: Icon,
  selected,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  value: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <Card
    className={cn(
      'hover:border-primary cursor-pointer transition-all',
      selected && 'border-primary',
    )}
    onClick={onClick}
  >
    <CardHeader>
      <Icon className="text-primary h-8 w-8" />
      <CardTitle className="text-lg">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  </Card>
);

export const GenerateRequirementForm = ({
  project,
  onSubmit,
  onCancel,
  initialValues,
}: GenerateStoriesFormProps) => {
  const currentSprint = project.sprints?.sort((a, b) => b.sprintNumber - a.sprintNumber)?.at(0);
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<StoryFormValues>({
    resolver: zodResolver(storyFormSchema),
    defaultValues: {
      sprintOption: 'backlog',
      storyInput: '',
      files: [],
      ...initialValues,
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    setIsLoading(true);
    await onSubmit(data);
    setIsLoading(false);
  });

  return (
    <Form {...form}>
      <div className="flex h-full flex-col gap-4">
        <FormField
          control={form.control}
          name="sprintOption"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How would you like to generate tasks?</FormLabel>
              <div className="grid grid-cols-2 gap-4">
                <SprintOptionCard
                  title="Add To Backlog"
                  description="Add tasks to the backlog"
                  icon={ListPlus}
                  value="backlog"
                  selected={field.value === 'backlog'}
                  onClick={() => field.onChange('backlog')}
                />
                <SprintOptionCard
                  title="Current Sprint"
                  description={`Add tasks to ${currentSprint?.name || 'current sprint'}`}
                  icon={ListPlus}
                  value="current"
                  selected={field.value === 'current'}
                  onClick={() => field.onChange('current')}
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="storyInput"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Extra Requirements (Optional)</FormLabel>
                <FormControl>
                  <MdxEditorComponent
                    markdown={field.value ?? ''}
                    onChange={(e) => {
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background text-muted-foreground px-2">Or Upload a File</span>
            </div>
          </div>

          <FormField
            control={form.control}
            name="files"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FileUploader
                    files={field.value || []}
                    onFilesSelected={field.onChange}
                    maxFiles={1}
                    acceptedFileTypes={{
                      'application/pdf': ['.pdf'],
                      'application/msword': ['.doc', '.docx'],
                      'text/plain': ['.txt'],
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="gap-1" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              'Generate'
            )}
          </Button>
        </div>
      </div>
    </Form>
  );
};
