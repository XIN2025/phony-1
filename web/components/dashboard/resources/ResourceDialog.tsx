import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProjectResource } from '@/types/project-resource';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { resourceTypes } from './resource-types';
import { DatePicker } from '@/components/DatePicker';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import { DAYS_OF_WEEK, generateCronExpression, resourceFormSchema } from './utils';
import { uploadFile } from '@/services/upload';
import { toast } from 'sonner';
import { FileUploader } from '@/components/ui/file-uploader';

export type ResourceFormData = z.output<typeof resourceFormSchema>;

interface ResourceDialogProps {
  projectId: string;
  resource?: ProjectResource | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: (data: ResourceFormData) => Promise<void>;
}

export function ResourceDialog({
  projectId,
  resource,
  open,
  setOpen,
  onSubmit,
}: ResourceDialogProps) {
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const form = useForm<ResourceFormData>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      projectId,
      resourceName: resource?.resourceName ?? '',
      resourceURL: resource?.resourceURL ?? '',
      resourceType: resource?.resourceType ?? 'document',
      scheduleType: resource?.scheduleType ?? 'none',
      scheduleTime: resource?.scheduleTime ?? '',
      scheduleDays: resource?.scheduleDays ?? [],
      scheduleDate: resource?.scheduleDate ? new Date(resource.scheduleDate) : undefined,
    },
  });

  const resourceType = form.watch('resourceType');

  useEffect(() => {
    if (resource) {
      form.reset({
        projectId: resource.projectId,
        resourceName: resource.resourceName,
        resourceURL: resource.resourceURL,
        resourceType: resource.resourceType,
        scheduleType: resource.scheduleType ?? 'none',
        scheduleTime: resource.scheduleTime ?? '',
        scheduleDays: resource.scheduleDays ?? [],
        scheduleDate: resource.scheduleDate ? new Date(resource.scheduleDate) : undefined,
      });
    } else {
      form.reset({
        projectId,
        resourceName: '',
        resourceURL: '',
        resourceType: 'document',
        scheduleType: 'none',
        scheduleTime: '',
        scheduleDays: [],
        scheduleDate: undefined,
      });
    }
    setUploadedFile(null);
  }, [form, projectId, resource]);

  // Reset uploaded file when resource type changes to non-document
  useEffect(() => {
    if (resourceType !== 'document') {
      setUploadedFile(null);
    }
  }, [resourceType]);

  const handleSubmit = async (data: ResourceFormData) => {
    setLoading(true);
    try {
      if ((data.resourceType === 'document' || data.resourceType === 'reference') && uploadedFile) {
        const res = await uploadFile(uploadedFile, 'resources');
        data.resourceURL = res.url;
      }
      if (data.resourceType === 'meeting' && data.resourceURL) {
        data.resourceURL = data.resourceURL.split('?')[0];
      }

      if (!data.resourceURL) {
        if (data.resourceType === 'document' || data.resourceType === 'reference') {
          toast.error('Please enter a URL or upload a file');
        } else {
          toast.error('Please enter a valid URL');
        }
        return;
      }

      // Generate cron expression and add it to the submission data
      const cronExpression = generateCronExpression(data);
      const submissionData = {
        ...data,
        ...(data.scheduleDate && {
          scheduleDate: (() => {
            const selectedDate = new Date(data.scheduleDate);
            const now = new Date();
            selectedDate.setHours(
              now.getHours(),
              now.getMinutes(),
              now.getSeconds(),
              now.getMilliseconds(),
            );
            return selectedDate;
          })(),
        }),
        cronExpression,
      };

      await onSubmit(submissionData);
      setOpen(false);
      form.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{resource ? 'Edit' : 'Add'} Resource</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="resourceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={loading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {resourceTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="resourceName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Resource Name" disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="resourceURL"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Resource URL" disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(form.watch('resourceType') === 'document' ||
              form.watch('resourceType') === 'reference') && (
              <FormItem>
                <FormLabel>Or Upload File</FormLabel>
                <FormControl>
                  <FileUploader
                    onFilesSelected={(files) => setUploadedFile(files[0] || null)}
                    files={uploadedFile ? [uploadedFile] : []}
                    maxFiles={1}
                    acceptedFileTypes={{
                      'application/pdf': ['.pdf'],
                      'application/msword': ['.doc'],
                      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
                        '.docx',
                      ],
                      'text/plain': ['.txt'],
                      'image/jpeg': ['.jpg', '.jpeg'],
                      'image/png': ['.png'],
                      'image/gif': ['.gif'],
                      'image/svg+xml': ['.svg'],
                      'text/csv': ['.csv'],
                      'application/vnd.ms-excel': ['.xls'],
                      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
                        '.xlsx',
                      ],
                      'application/vnd.ms-powerpoint': ['.ppt'],
                      'application/vnd.openxmlformats-officedocument.presentationml.presentation': [
                        '.pptx',
                      ],
                      'application/zip': ['.zip'],
                      'application/x-rar-compressed': ['.rar'],
                      'application/json': ['.json'],
                      'text/markdown': ['.md'],
                    }}
                    fileSupportedTypes={[
                      'pdf',
                      'doc',
                      'docx',
                      'txt',
                      'xls',
                      'xlsx',
                      'ppt',
                      'pptx',
                      'zip',
                      'rar',
                      'json',
                      'md',
                    ]}
                  />
                </FormControl>
                <div className="text-muted-foreground mt-1 text-xs">
                  {uploadedFile
                    ? 'File will be uploaded when you submit the form'
                    : 'Upload a file or provide a URL'}
                </div>
              </FormItem>
            )}

            {form.watch('resourceType') === 'meeting' && (
              <>
                <FormField
                  control={form.control}
                  name="scheduleType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Schedule</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => {
                            field.onChange(value);
                            if (value === 'none') {
                              form.setValue('scheduleTime', '');
                              form.setValue('scheduleDays', []);
                              form.setValue('scheduleDate', undefined);
                            }
                          }}
                          defaultValue={field.value}
                          className="flex items-center gap-4"
                        >
                          <FormItem className="flex items-center space-y-0 space-x-3">
                            <FormControl>
                              <RadioGroupItem value="none" />
                            </FormControl>
                            <FormLabel className="font-normal">No Schedule</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-y-0 space-x-3">
                            <FormControl>
                              <RadioGroupItem value="daily" />
                            </FormControl>
                            <FormLabel className="font-normal">Daily</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-y-0 space-x-3">
                            <FormControl>
                              <RadioGroupItem value="recurring" />
                            </FormControl>
                            <FormLabel className="font-normal">Recurring</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch('scheduleType') !== 'none' && (
                  <FormField
                    control={form.control}
                    name="scheduleTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            placeholder="Select time"
                            {...field}
                            className={cn(
                              form.formState.errors.scheduleTime && 'border-destructive',
                              'w-full',
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {form.watch('scheduleType') === 'daily' && (
                  <FormField
                    control={form.control}
                    name="scheduleDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <div
                            className={cn(
                              form.formState.errors.scheduleDate && 'border-destructive rounded-md',
                            )}
                          >
                            <DatePicker date={field.value} {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {form.watch('scheduleType') === 'recurring' && (
                  <FormField
                    control={form.control}
                    name="scheduleDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Days</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              {DAYS_OF_WEEK.map((day) => (
                                <Button
                                  key={day.value}
                                  type="button"
                                  variant={field.value?.includes(day.value) ? 'default' : 'outline'}
                                  onClick={() => {
                                    const newDays = field.value?.includes(day.value)
                                      ? field.value.filter((d) => d !== day.value)
                                      : [...(field.value || []), day.value];
                                    field.onChange(newDays);
                                  }}
                                  className="w-14 px-3 py-1"
                                >
                                  {day.value}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}

            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {resource ? 'Update' : 'Add'} Resource
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
