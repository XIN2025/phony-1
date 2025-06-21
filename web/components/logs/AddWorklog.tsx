import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { UserStoriesDto } from '@/types/user-stories';
import { Bug } from '@/types/bug';
import { LogMeetingData } from '@/types/meeting-data';
import { Wiki } from '@/types/wiki';
import { addWorklogSchema, AddWorklogFormData } from '@/lib/validations/worklog.schema';
import { WorklogService } from '@/services/worklog.api';
import { toast } from 'sonner';
import { Project } from '@/types/project';

type AddWorklogProps = {
  onAddWorklog: () => void;
  stories: UserStoriesDto[];
  bugs: Bug[];
  meetings: LogMeetingData[];
  wikis: Wiki[];
  project: Project;
};

const AddWorklog = ({ onAddWorklog, stories, bugs, meetings, wikis, project }: AddWorklogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AddWorklogFormData>({
    resolver: zodResolver(addWorklogSchema),
    defaultValues: {
      date: new Date().toISOString(),
      hoursWorked: 1,
      description: '',
      type: 'story',
    },
  });

  const watchedType = form.watch('type');

  // Filter stories to show only not done ones
  const notDoneStories = stories.filter((story) => story.status !== 'done');

  const onSubmit = async (data: AddWorklogFormData) => {
    try {
      setIsLoading(true);
      if (!project) {
        toast.error('Project not found');
        return;
      }
      const createWorklogData = {
        projectId: project?.id ?? '',
        hoursWorked: data.hoursWorked,
        description: data.description,
        date: new Date().toISOString(),
        bugId: data.type === 'bug' ? data.bugId : undefined,
        storyId: data.type === 'story' ? data.storyId : undefined,
        meetingId: data.type === 'meeting' ? data.meetingId : undefined,
        wikiId: data.type === 'wiki' ? data.wikiId : undefined,
      };

      const res = await WorklogService.createWorklog(createWorklogData);
      if (res.error) {
        toast.error(res.error.message);
        return;
      }
      toast.success('Worklog added successfully');
      form.reset();
      setOpen(false);
      onAddWorklog();
    } catch {
      toast.error('Failed to add worklog');
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectOptions = () => {
    switch (watchedType) {
      case 'bug':
        return bugs.map((bug) => ({ value: bug.id, label: bug.title }));
      case 'story':
        return notDoneStories.map((story) => ({ value: story.id, label: story.title }));
      case 'wiki':
        return wikis.map((wiki) => ({ value: wiki.id, label: wiki.title || 'Unknown' }));
      case 'meeting':
        return meetings.map((meeting) => ({ value: meeting.id, label: meeting.title }));
      default:
        return [];
    }
  };

  const getSelectFieldName = () => {
    switch (watchedType) {
      case 'bug':
        return 'bugId';
      case 'story':
        return 'storyId';
      case 'wiki':
        return 'wikiId';
      case 'meeting':
        return 'meetingId';
      default:
        return 'storyId';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={'sm'}>Add Worklog</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Worklog</DialogTitle>
          <DialogDescription>Add a worklog to the current project</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="hoursWorked"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hours Worked</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="24"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What did you work on?"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      ['storyId', 'bugId', 'wikiId', 'meetingId']
                        .filter((key) => key !== `${value}Id`)
                        .forEach((key) => {
                          form.setValue(key as keyof AddWorklogFormData, undefined);
                        });
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="story">Story</SelectItem>
                      <SelectItem value="bug">Bug</SelectItem>
                      <SelectItem value="wiki">Wiki</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              key={getSelectFieldName()}
              name={getSelectFieldName() as keyof AddWorklogFormData}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {watchedType.charAt(0).toUpperCase() + watchedType.slice(1)}
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value as string}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select a ${watchedType}`} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getSelectOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Worklog'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddWorklog;
