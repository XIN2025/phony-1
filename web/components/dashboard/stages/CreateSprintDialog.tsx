'use client';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FileUploader } from '@/components/ui/file-uploader';
import { Separator } from '@/components/ui/separator';
import { ProjectService } from '@/services';
import { toast } from 'sonner';
import { DatePicker } from '@/components/DatePicker';
import { Project, Sprint } from '@/types/project';
import MdxEditorComponent from '@/components/MdxEditor';

const formSchema = z.object({
  title: z.string().min(1, 'Sprint title is required'),
  requirements: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  shiftData: z.boolean(),
});

type Props = {
  project: Project;
  onSuccess: (sprint: Sprint) => void;
};

export default function CreateSprintDialog({ project, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      requirements: '',
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 14)),
      shiftData: false,
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('startDate', values.startDate?.toISOString() || '');
      formData.append('endDate', values.endDate?.toISOString() || '');
      formData.append('shiftData', values.shiftData.toString());
      if (values.requirements) {
        formData.append('requirements', values.requirements);
      }
      if (uploadedFiles.length > 0) {
        formData.append('file', uploadedFiles[0]);
      }

      const response = await ProjectService.createSprint(project.id, formData);

      if (response?.data) {
        toast.success('Sprint created successfully');
        setOpen(false);
        form.reset();
        setUploadedFiles([]);
        onSuccess(response.data);
      } else {
        toast.error(response.error.message);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create sprint');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size={'sm'}
          className="h-8 gap-2 text-sm font-light max-sm:px-3 max-sm:text-sm"
        >
          <PlusCircle className="h-4 w-4" />
          Create Sprint
        </Button>
      </DialogTrigger>
      <DialogContent className="no-scrollbar h-[90vh] overflow-y-auto sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Create New Sprint</DialogTitle>
          <DialogDescription>
            Add a new sprint by providing a title and requirements
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sprint Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter sprint title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex w-full items-center gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <DatePicker date={field.value} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <DatePicker date={field.value} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {project.sprints?.length ? (
              <FormField
                control={form.control}
                name="shiftData"
                render={({ field }) => (
                  <FormItem className="bg-accent/10 hover:bg-accent/20 flex flex-row items-center justify-between rounded-lg border p-5 shadow-xs transition-colors">
                    <div className="space-y-1.5">
                      <FormLabel className="text-base font-medium">
                        Transfer Unfinished Tasks
                      </FormLabel>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Automatically import incomplete tasks from your previous sprint to maintain
                        workflow continuity
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-primary"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            ) : null}

            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requirements</FormLabel>
                  <FormControl>
                    <div className="space-y-6">
                      <MdxEditorComponent
                        markdown={field.value ?? ''}
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                      />
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <Separator className="w-full" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background text-muted-foreground px-2">
                            Or Upload a File
                          </span>
                        </div>
                      </div>
                      <FileUploader
                        onFilesSelected={setUploadedFiles}
                        files={uploadedFiles}
                        maxFiles={1}
                        acceptedFileTypes={{
                          'application/pdf': ['.pdf'],
                          'application/msword': ['.doc', '.docx'],
                          'text/plain': ['.txt'],
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setUploadedFiles([]);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Sprint'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
