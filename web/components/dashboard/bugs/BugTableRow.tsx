import { Bug, BugStatusType } from '@/types/bug';
import { ProjectMember } from '@/types/project';
import React, { useEffect, useRef, useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImageIcon, MicIcon, FileOutput } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import BugStatusPopover from './BugStatusPopover';
import BugAssigneePopover from './BugAssigneePopover';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import AddWorklogPopover from '../AddWorklogPopover';
import { WorklogService } from '@/services/worklog.api';
import { toast } from 'sonner';

type BugTableRowProps = {
  bug: Bug;
  onClick?: () => void;
  onStatusChange?: (bugId: string, status: BugStatusType) => void;
  onConvertToTask?: (bugId: string) => void;
  projectMembers: ProjectMember[];
  onAssign: (bugId: string, assigneeId: string | null) => Promise<void>;
};

const BugTableRow = ({
  bug,
  onClick,
  onStatusChange,
  onAssign,
  projectMembers,
  onConvertToTask,
}: BugTableRowProps) => {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const creatorInitials = `${bug.creator.first_name[0]}${bug.creator.last_name[0]}`.toUpperCase();
  const timeAgo = formatDistanceToNow(new Date(bug.createdAt), { addSuffix: true });
  const searchParams = useSearchParams();
  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;

  const onAddLog = async (timeSpent: number, description: string) => {
    try {
      toast.promise(
        WorklogService.createWorklog({
          date: new Date().toISOString(),
          hoursWorked: timeSpent,
          projectId: bug.projectId,
          bugId: bug.id,
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
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const bugId = searchParams.get('bugId');
    if (bugId === bug.id && onClickRef.current) {
      onClickRef.current();
    }
  }, [searchParams, bug.id]);

  return (
    <TableRow className="hover:bg-accent/50 cursor-pointer transition-colors" onClick={onClick}>
      <TableCell className="p-2 font-medium">{bug.title}</TableCell>
      <TableCell className="p-2" onClick={(e) => e.stopPropagation()}>
        <AddWorklogPopover onAddLog={onAddLog} />
      </TableCell>
      <TableCell className="p-2">
        <BugStatusPopover
          bug={bug}
          showModal={showStatusModal}
          setShowModal={setShowStatusModal}
          onStatusChange={onStatusChange || (() => {})}
        />
      </TableCell>
      <TableCell className="p-2">
        <BugAssigneePopover
          bug={bug}
          projectMembers={projectMembers}
          onAssigneeChange={async (bugId, assigneeId) => await onAssign(bugId, assigneeId ?? null)}
        />
      </TableCell>
      <TableCell className="p-2">
        <div className="flex items-center justify-center gap-2">
          <Tooltip>
            <TooltipTrigger>
              <Avatar className="h-7 w-7">
                <AvatarImage src={bug.creator.avatar_url} alt={creatorInitials} />
                <AvatarFallback className="text-xs">{creatorInitials}</AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>{`${bug.creator.first_name} ${bug.creator.last_name}`}</TooltipContent>
          </Tooltip>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground p-2 text-center text-sm">{timeAgo}</TableCell>

      <TableCell className="p-2">
        <div className="text-muted-foreground flex items-center justify-center gap-2">
          {bug.screenshots.length > 0 && (
            <div className="flex items-center gap-1">
              <ImageIcon className="h-4 w-4" />
              <span className="text-xs">{bug.screenshots.length}</span>
            </div>
          )}
          {bug.voiceFeedbackUrl && (
            <div className="flex items-center gap-1">
              <MicIcon className="h-4 w-4" />
            </div>
          )}
        </div>
      </TableCell>
      <TableCell
        onClick={(e) => e.stopPropagation()}
        className="text-muted-foreground p-2 text-center text-sm"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8"
              size="icon"
              onClick={() => onConvertToTask?.(bug.id)}
            >
              <FileOutput className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Convert to task</TooltipContent>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default BugTableRow;
