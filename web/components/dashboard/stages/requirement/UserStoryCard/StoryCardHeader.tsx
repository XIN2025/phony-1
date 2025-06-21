import { Button } from '@/components/ui/button';
import { UserStoriesDto } from '@/types/user-stories';
import { ProjectMember } from '@/types/project';
import React, { useState, useRef } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import AssigneePopover from './AssigneePopover';
import StatusPopover from './StatusPopover';
import PriorityPopover from './PriorityPopover';
import EstimationPopover from './EstimationPopover';
import { GripVertical, Trash } from 'lucide-react';
import StoryTitle from './StoryTitle';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent } from '@/components/ui/tooltip';
import { TooltipTrigger } from '@/components/ui/tooltip';
import { useWorklog } from '@/contexts/worklog.context';
import AddWorklogPopover from '@/components/dashboard/AddWorklogPopover';
import { WorklogService } from '@/services/worklog.api';
import { toast } from 'sonner';

type Props = {
  story: UserStoriesDto;
  projectMembers: ProjectMember[];
  onChangeStory: (story: UserStoriesDto) => void;
  setShowDeleteAlert: (show: boolean) => void;
  onClick?: () => void;
  isNew?: boolean;
  isReordering?: boolean;
};

const StoryCardHeader = ({
  story,
  projectMembers,
  onClick,
  onChangeStory,
  setShowDeleteAlert,
  isNew = false,
  isReordering = false,
}: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: story.id,
    disabled: isNew,
  });

  const isWorklogUser = useWorklog().isWorklogUser;

  const [showAssigneeModal, setShowAssigneeModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [showEstimationPopover, setShowEstimationPopover] = useState(false);
  const rowRef = useRef<HTMLTableRowElement | null>(null);

  const onAddLog = async (timeSpent: number, description: string) => {
    try {
      toast.promise(
        WorklogService.createWorklog({
          date: new Date().toISOString(),
          hoursWorked: timeSpent,
          projectId: story.projectId,
          storyId: story.id,
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
      console.error('Error adding worklog');
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isReordering ? 0.7 : 1,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={{ ...style, pointerEvents: isReordering ? 'none' : 'auto' }}
      className={`bg-background!`}
    >
      <TableCell className="group relative p-1 pl-14" onClick={onClick}>
        {!isNew && (
          <button
            className="hover:text-primary absolute top-0 bottom-0 left-8 cursor-grab touch-none"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical size={18} />
          </button>
        )}
        <StoryTitle
          rowRef={rowRef}
          story={story}
          onChangeStory={onChangeStory}
          setShowDeleteAlert={setShowDeleteAlert}
          isNew={isNew}
        />
      </TableCell>
      {isWorklogUser && (
        <TableCell className="p-1 text-center">
          <AddWorklogPopover onAddLog={onAddLog} />
        </TableCell>
      )}
      <TableCell className="p-1 text-center">
        <StatusPopover
          story={story}
          showModal={showStatusModal}
          setShowModal={(show) => {
            if (!isNew) {
              setShowStatusModal(show);
            }
          }}
          onChangeStory={onChangeStory}
        />
      </TableCell>
      <TableCell className="p-1 text-center">
        <PriorityPopover
          story={story}
          showModal={showPriorityModal}
          setShowModal={(show) => {
            if (!isNew) {
              setShowPriorityModal(show);
            }
          }}
          onChangeStory={onChangeStory}
        />
      </TableCell>
      <TableCell className="p-1 text-center">
        <EstimationPopover
          story={story}
          showModal={showEstimationPopover}
          setShowModal={(show) => {
            if (!isNew) {
              setShowEstimationPopover(show);
            }
          }}
          onChangeStory={onChangeStory}
        />
      </TableCell>
      <TableCell className="p-1 text-center">
        <Tooltip>
          <TooltipTrigger>
            <div className="flex items-center justify-center">
              {story.creator ? (
                <Avatar className="h-7 w-7">
                  <AvatarImage src={story.creator?.avatarUrl} />
                  <AvatarFallback>
                    {story.creator?.firstName?.slice(0, 2)?.toUpperCase() ?? 'OG'}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="bg-muted flex h-7 w-7 items-center justify-center rounded-full border">
                  <span className="text-center">UN</span>
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {story.creator
              ? `Created by ${story.creator.firstName} ${story.creator.lastName}`
              : 'Unknown'}
          </TooltipContent>
        </Tooltip>
      </TableCell>
      <TableCell className="p-1 text-center">
        <AssigneePopover
          story={story}
          projectMembers={projectMembers}
          showModal={showAssigneeModal}
          setShowModal={(show) => {
            if (!isNew) {
              setShowAssigneeModal(show);
            }
          }}
          onChangeStory={onChangeStory}
        />
      </TableCell>
      <TableCell className="p-1 text-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteAlert(true);
          }}
          className="h-8 w-8 hover:text-red-600"
        >
          <Trash size={15} />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default StoryCardHeader;
