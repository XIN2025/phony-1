import React, { useState } from 'react';
import { MeetingData, UpdateMeetingData } from '@/types/meeting-data';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Clock, Trash2, User, Pencil, ArrowLeftRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import SummarySheet from './SummarySheet';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Project } from '@/types/project';
import { getDuration } from './utils';
import GenerateRequirementDialog from './GenerateRequirementDialog';
import AddWorklogPopover from '../AddWorklogPopover';
import { toast } from 'sonner';
import { WorklogService } from '@/services/worklog.api';

type MeetingCardProps = {
  meeting: MeetingData;
  onDelete: (id: string) => Promise<void>;
  project?: Project;
  onEditSummary: (id: string, data: UpdateMeetingData) => Promise<void>;
  onEditTitle?: (id: string, title: string) => Promise<void>;
  onMoveToProject: (id: string) => void;
};

const MeetingCard = ({
  meeting,
  onDelete,
  onEditSummary,
  project,
  onEditTitle,
  onMoveToProject,
}: MeetingCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(
    meeting.title ?? meeting.resource?.resourceName ?? project?.title ?? '',
  );

  const handleTitleEdit = async () => {
    if (!editedTitle.trim()) return;
    if (!onEditTitle) return;

    try {
      setIsSavingTitle(true);
      await onEditTitle(meeting.id, editedTitle.trim());
      setIsEditingTitle(false);
    } catch {
      setEditedTitle(meeting.title ?? meeting.resource?.resourceName ?? project?.title ?? '');
    } finally {
      setIsSavingTitle(false);
    }
  };

  const handleTitleCancel = () => {
    setEditedTitle(meeting.title ?? meeting.resource?.resourceName ?? project?.title ?? '');
    setIsEditingTitle(false);
  };

  const meetingTime = format(new Date(meeting.metadata?.startDate || meeting.createdAt), 'h:mm a');
  const onAddLog = async (timeSpent: number, description: string) => {
    try {
      toast.promise(
        WorklogService.createWorklog({
          date: new Date().toISOString(),
          hoursWorked: timeSpent,
          projectId: meeting.projectId,
          meetingId: meeting.id,
          description,
        }),
        {
          loading: 'Adding worklog...',
          success: (res) => {
            if (res.data) {
              return 'Worklog added successfully';
            }
            throw new Error('Failed to add worklog');
          },
          error: () => {
            return 'Error adding worklog';
          },
        },
      );
    } catch {
      // Do nothing
    }
  };
  return (
    <Card className="bg-accent/60 hover:bg-accent/55 p-0 transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="">
              {meeting.title ?? meeting.resource?.resourceName ?? project?.title ?? ''}
            </div>
            <div className="text-primary flex items-center gap-3 text-sm">
              {meeting.creator && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={meeting.creator.avatar_url} />
                        <AvatarFallback>
                          <User className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Created by {meeting.creator.first_name} {meeting.creator.last_name}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {/* move to project button */}
              {!meeting.isStoriesCreated && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onMoveToProject(meeting.id)}
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              )}
              <AddWorklogPopover onAddLog={onAddLog} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">{meetingTime}</span>
              <div className="text-muted-foreground mr-1 flex items-center text-sm">
                <Clock className="mr-1.5 h-3.5 w-3.5" />
                <span>{getDuration(meeting)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onEditTitle && (
              <Popover
                open={isEditingTitle}
                onOpenChange={(open) => {
                  if (open) {
                    setEditedTitle(
                      meeting.title ?? meeting.resource?.resourceName ?? project?.title ?? '',
                    );
                  }
                  setIsEditingTitle(open);
                }}
              >
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Pencil size={14} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="leading-none font-medium">Edit Title</h4>
                      <Input
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        placeholder="Enter title"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleTitleEdit();
                          } else if (e.key === 'Escape') {
                            handleTitleCancel();
                          }
                        }}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={handleTitleCancel}>
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleTitleEdit}
                        disabled={isSavingTitle || !editedTitle.trim()}
                      >
                        {isSavingTitle ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
            {onDelete && (
              <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Meeting</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this meeting? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive hover:bg-destructive/90"
                      disabled={isDeleting}
                      onClick={async (e) => {
                        e.preventDefault();
                        setIsDeleting(true);
                        await onDelete(meeting.id);
                        setIsDeleting(false);
                        setIsOpen(false);
                      }}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <SummarySheet
            onEdit={async (summary) => {
              await onEditSummary(meeting.id, {
                transcript: meeting.transcript,
                summary,
                metadata: meeting.metadata,
              });
            }}
            meeting={meeting}
          />
        </div>
        {project && (
          <div className="mt-2 flex gap-2">
            <GenerateRequirementDialog project={project} meeting={meeting} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MeetingCard;
