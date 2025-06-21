'use client';

import { useCallback, useEffect, useState } from 'react';
import { MeetingDataService } from '@/services';
import { MeetingData, UpdateMeetingData } from '@/types/meeting-data';
import MeetingCard from './MeetingCard';
import { MessageSquare } from 'lucide-react';
import LoadingScreen from '@/components/LoadingScreen';
import { toast } from 'sonner';
import AudioRecorder from '@/components/AudioRecorder';
import { getDateHeading, groupMeetingsByDate } from './utils';
import MoveToProjectDialog from './MoveToProjectDialog';
import { useProjectStore } from '@/stores/useProjectStore';

const GlobalMeetingsPage = () => {
  const [meetings, setMeetings] = useState<MeetingData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const { fetchProjects } = useProjectStore();
  const [moveToProjectDialog, setMoveToProjectDialog] = useState<{
    open: boolean;
    meetingId: string;
  } | null>(null);
  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await MeetingDataService.getGlobalMeetings();
      if (response && response.data) {
        setMeetings(response.data);
      } else {
        setMeetings(null);
      }
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
      setMeetings(null);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchMeetings();
    fetchProjects();
  }, [fetchMeetings, fetchProjects]);

  const handleDelete = async (meetingId: string) => {
    try {
      const res = await MeetingDataService.deleteMeetingData(meetingId);
      if (res.data) {
        setMeetings(
          (prevMeetings) => prevMeetings?.filter((meeting) => meeting.id !== meetingId) ?? [],
        );
        toast.success('Meeting data deleted successfully');
      } else {
        toast.error(res.error?.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditSummary = async (id: string, data: UpdateMeetingData) => {
    if (!meetings) return;
    try {
      const res = await MeetingDataService.updateMeetingData(id, data);
      if (res.data) {
        const oldMeetings = meetings.map((meeting) => (meeting.id === id ? res.data : meeting));
        setMeetings(oldMeetings);
        toast.success('Meeting summary updated successfully');
      } else {
        toast.error(res.error?.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditTitle = async (id: string, title: string) => {
    if (!meetings) return;
    try {
      const meeting = meetings.find((m) => m.id === id);
      if (!meeting) return;

      const res = await MeetingDataService.updateMeetingData(id, {
        title,
        transcript: meeting.transcript,
        summary: meeting.summary,
        metadata: meeting.metadata,
      });

      if (res.data) {
        const oldMeetings = meetings.map((meeting) => (meeting.id === id ? res.data : meeting));
        setMeetings(oldMeetings);
        toast.success('Meeting title updated successfully');
      } else {
        toast.error(res.error?.message);
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to update meeting title');
    }
  };

  const handleMoveToProject = async (meetingId: string, projectId: string) => {
    try {
      const res = await MeetingDataService.moveToProject(meetingId, projectId);
      if (res.data) {
        setMeetings(
          (prevMeetings) => prevMeetings?.filter((meeting) => meeting.id !== meetingId) ?? [],
        );
        toast.success('Meeting moved to project successfully');
      } else {
        toast.error('Failed to move meeting to project', {
          description: res.error.message,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) {
    return <LoadingScreen type="logo" className="pt-20" />;
  }

  if (!meetings || meetings.length === 0) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <MessageSquare className="text-primary h-5 w-5" />
              <h1 className="font-bold">Meeting Summaries</h1>
            </div>
            <p className="text-muted-foreground text-sm">
              View and manage your meeting recordings and summaries
            </p>
          </div>
          <AudioRecorder />
        </div>
        <div className="py-12 text-center">
          <div className="mb-2">No meetings recorded yet</div>
          <p className="text-muted-foreground mx-auto max-w-md text-sm">
            Record your first meeting using the button above and transform conversations into
            actionable insights!
          </p>
        </div>
      </div>
    );
  }

  const groupedMeetings = groupMeetingsByDate(meetings);

  return (
    <div className="mx-auto max-w-7xl px-2 py-5">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <MessageSquare className="text-primary h-5 w-5" />
            <h1 className="font-bold">Meeting Summaries</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            View and manage your meeting recordings and summaries
          </p>
        </div>
        <AudioRecorder />
      </div>

      <div className="space-y-6">
        {Object.entries(groupedMeetings)
          .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
          .map(([date, dateMeetings]) => (
            <section key={date}>
              <div className="mb-3">
                <h2 className="text-lg font-semibold">{getDateHeading(date)}</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {dateMeetings.map((meeting) => (
                  <MeetingCard
                    onEditSummary={handleEditSummary}
                    onEditTitle={handleEditTitle}
                    onDelete={handleDelete}
                    key={meeting.id}
                    meeting={meeting}
                    onMoveToProject={(id) => {
                      setMoveToProjectDialog({
                        open: true,
                        meetingId: id,
                      });
                    }}
                  />
                ))}
              </div>
            </section>
          ))}
      </div>
      {moveToProjectDialog && (
        <MoveToProjectDialog
          open={moveToProjectDialog.open}
          meetingId={moveToProjectDialog.meetingId}
          onOpenChange={(open) => {
            setMoveToProjectDialog({
              ...moveToProjectDialog,
              open,
            });
          }}
          onMoveToProject={handleMoveToProject}
        />
      )}
    </div>
  );
};

export default GlobalMeetingsPage;
