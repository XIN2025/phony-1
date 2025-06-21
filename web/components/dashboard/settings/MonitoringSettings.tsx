'use client';
import { Project } from '@/types/project';
import { ProjectService } from '@/services';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Label } from '../../ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { urlSchema, type UrlSchemaType } from '@/lib/validations/url';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

interface MonitoringSettingsProps {
  project: Project;
  setProject: (project: Project) => void;
}

const MonitoringSettings = ({ project, setProject }: MonitoringSettingsProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UrlSchemaType>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      url: '',
    },
  });

  const handleAddUrl = async (data: UrlSchemaType) => {
    try {
      setIsLoading(true);
      const updatedUrls = [...(project.monitoringUrls || []), data.url];

      const response = await ProjectService.updateProject(project.id, {
        ...project,
        monitoringUrls: updatedUrls,
      });

      if (response.data) {
        setProject({
          ...project,
          monitoringUrls: updatedUrls,
        });
        form.reset();
        toast.success('URL added successfully');
      } else {
        toast.error(response?.error?.message);
      }
    } catch {
      toast.error('Failed to add URL');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUrl = async (urlToRemove: string) => {
    try {
      setIsLoading(true);
      const updatedUrls = (project.monitoringUrls || []).filter((url) => url !== urlToRemove);

      const response = await ProjectService.updateProject(project.id, {
        ...project,
        monitoringUrls: updatedUrls,
      });

      if (response.data) {
        setProject({
          ...project,
          monitoringUrls: updatedUrls,
        });
        toast.success('URL removed successfully');
      } else {
        toast.error(response?.error?.message);
      }
    } catch {
      toast.error('Failed to remove URL');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">URL Monitoring</h3>
        <p className="text-muted-foreground text-sm">
          Add URLs to monitor their uptime. You&apos;ll receive email notifications if any URL goes
          down.
        </p>
      </div>

      <div className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAddUrl)} className="space-y-2">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="url">Add URL to Monitor</Label>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        {...field}
                        id="url"
                        placeholder="https://your-website.com"
                        disabled={isLoading}
                        className="flex-1"
                      />
                    </FormControl>
                    <Button type="submit" disabled={isLoading} className="shrink-0">
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      <span className="ml-2">Add URL</span>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <div className="mt-6 space-y-2">
          <Label>Monitored URLs</Label>
          {(!project.monitoringUrls || project.monitoringUrls.length === 0) && (
            <p className="text-muted-foreground text-sm">No URLs being monitored</p>
          )}
          {project.monitoringUrls?.map((url) => (
            <div key={url} className="flex items-center justify-between rounded-md border p-3">
              <span className="pr-2 text-sm break-all">{url}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveUrl(url)}
                disabled={isLoading}
                className="shrink-0"
              >
                <Trash2 className="text-destructive h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonitoringSettings;
