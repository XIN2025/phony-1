'use client';
import { useParams } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { DatePicker } from '@/components/DatePicker';
import { WorklogService } from '@/services/worklog.api';
import { WorklogDto } from '@/types/worklog';
import { WorklogCard } from './WorklogCard';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import AddWorklog from './AddWorklog';
import { UserStoriesDto } from '@/types/user-stories';
import { Bug } from '@/types/bug';
import { LogMeetingData } from '@/types/meeting-data';
import { Wiki } from '@/types/wiki';
import { Project } from '@/types/project';

const WorklogPage = ({
  stories,
  bugs,
  meetings,
  wikis,
  project,
}: {
  stories: UserStoriesDto[];
  bugs: Bug[];
  meetings: LogMeetingData[];
  wikis: Wiki[];
  project: Project;
}) => {
  const { name: projectName } = useParams();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [worklogs, setWorklogs] = useState<WorklogDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorklogs = useCallback(
    async (date: Date) => {
      if (!projectName) return;

      setLoading(true);
      setError(null);

      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const formattedDate = format(date, 'yyyy-MM-dd');

        const response = await WorklogService.getMyWorklogs({
          projectName: projectName as string,
          date: formattedDate,
          timezone,
        });

        setWorklogs(response.data || []);
      } catch (err) {
        setError('Failed to fetch worklogs');
        console.error('Error fetching worklogs:', err);
      } finally {
        setLoading(false);
      }
    },
    [projectName],
  );

  useEffect(() => {
    fetchWorklogs(selectedDate);
  }, [fetchWorklogs, selectedDate]);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleUpdate = () => {
    fetchWorklogs(selectedDate);
  };

  const handleDelete = async (worklogId: string) => {
    try {
      toast.promise(WorklogService.deleteWorklog(worklogId), {
        loading: 'Deleting worklog...',
        success: (res) => {
          if (res.data) {
            setWorklogs((prev) => prev.filter((worklog) => worklog.id !== worklogId));
            return 'Worklog deleted successfully';
          }
          return 'Failed to delete worklog';
        },
        error: 'Failed to delete worklog',
      });
    } catch (err) {
      console.error('Error deleting worklog:', err);
      alert('Failed to delete worklog. Please try again.');
    }
  };

  const totalHours = worklogs.reduce((sum, worklog) => sum + worklog.hoursWorked, 0);

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="space-y-6">
        <div className="flex flex-col space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Work Logs</h1>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-64">
                <DatePicker date={selectedDate} onChange={handleDateChange} />
              </div>
              {totalHours > 0 && (
                <div className="text-muted-foreground text-sm">
                  Total: <span className="font-semibold">{totalHours} hours</span>
                </div>
              )}
            </div>
            <AddWorklog
              onAddWorklog={() => {
                fetchWorklogs(selectedDate);
              }}
              stories={stories}
              bugs={bugs}
              meetings={meetings}
              wikis={wikis}
              project={project}
            />
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-muted-foreground ml-2">Loading worklogs...</span>
          </div>
        )}

        {error && (
          <div className="border-destructive/20 bg-destructive/10 rounded-lg border p-4">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && worklogs.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              No worklogs found for {format(selectedDate, 'PPP')}
            </p>
          </div>
        )}

        {!loading && worklogs.length > 0 && (
          <div className="grid gap-4">
            {worklogs.map((worklog) => (
              <WorklogCard
                key={worklog.id}
                worklog={worklog}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorklogPage;
