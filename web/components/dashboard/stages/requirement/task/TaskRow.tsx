import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { TaskDto, UpdateTaskDto } from '@/types/user-stories';
import { ChevronRight, Trash, X, Check, Loader2, GripVertical, Edit2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { STATUS_VARIANTS } from '../UserStoryCard/constants';
import { Button } from '@/components/ui/button';
import { TaskService } from '@/services';
import { toast } from 'sonner';
import ResearchSheet from './ResearchSheet';
import { MoveTaskButton } from './MoveTaskButton';
import TaskType from './TaskType';
import { useWorklog } from '@/contexts/worklog.context';

const getTaskStatus = (task: TaskDto) => {
  if (task.stories.length === 0) {
    return 'Todo';
  }
  if (task.stories.every((story) => story.status === 'Done')) {
    return 'Done';
  }
  if (task.stories.every((story) => story.status === 'Todo')) {
    return 'Todo';
  }
  if (task.stories.some((story) => story.status === 'InReview')) {
    return 'InReview';
  }
  if (task.stories.some((story) => story.status === 'Blocked')) {
    return 'Blocked';
  }
  if (task.stories.some((story) => story.status === 'Testing')) {
    return 'Testing';
  }
  return 'InProgress';
};

type Props = {
  task: TaskDto;
  open: boolean;
  setOpen: (open: boolean) => void;
  onDelete: () => void;
  onMove: () => void;
  onTaskChange: (task: TaskDto) => Promise<void>;
  onDiscard?: () => void;
  isEditing?: boolean;
};

const TaskRow: React.FC<Props> = ({
  task,
  open,
  setOpen,
  onDelete,
  onMove,
  onTaskChange,
  onDiscard,
  isEditing: isEditingProp,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const [isEditing, setIsEditing] = useState(isEditingProp || false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editedDesc, setEditedDesc] = useState(task.description || '');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = React.useRef<HTMLDivElement>(null);
  const descRef = React.useRef<HTMLDivElement>(null);
  const isWorklogUser = useWorklog().isWorklogUser;

  const handleDiscard = useCallback(() => {
    setEditedTitle(task.title);
    onDiscard?.();
    setIsEditing(false);
  }, [onDiscard, task.title]);

  const handleDiscardDesc = useCallback(() => {
    setEditedDesc(task.description || '');
    setIsEditingDesc(false);
  }, [task.description]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isEditing && inputRef.current && !inputRef.current.contains(event.target as Node)) {
        handleDiscard();
      }
      if (isEditingDesc && descRef.current && !descRef.current.contains(event.target as Node)) {
        handleDiscardDesc();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleDiscard, handleDiscardDesc, isEditing, isEditingDesc]);

  useEffect(() => {
    setEditedTitle(task.title);
    setEditedDesc(task.description || '');
    if (isEditingProp !== undefined) {
      setIsEditing(isEditingProp);
    }
  }, [task.title, task.description, isEditingProp]);

  const handleUpdateTask = async (body: UpdateTaskDto) => {
    try {
      setIsLoading(true);
      if (!task.id) {
        // For new task
        await onTaskChange({ ...task, ...body });
        setIsEditingDesc(false);
        setIsEditing(false);
        setIsLoading(false);
        return;
      }
      // For existing task
      const res = await TaskService.updateTask(task.id, body);
      if (res?.data) {
        onTaskChange(res.data);
        setIsEditingDesc(false);
        setIsEditing(false);
      } else {
        toast.error('Failed to update task');
      }
    } catch {
      toast.error('Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!editedTitle.trim()) {
      toast.error('Title cannot be empty');
      return;
    }
    handleUpdateTask({ title: editedTitle.trim() });
  };

  const handleSaveDesc = () => {
    if (!editedDesc.trim()) {
      toast.error('Description cannot be empty');
      return;
    }
    handleUpdateTask({ description: editedDesc.trim() });
  };

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.id) {
      setIsEditing(true);
    }
  };

  const estimation = useMemo(() => {
    return task?.stories?.reduce((acc, story) => acc + story?.estimation, 0);
  }, [task?.stories]);

  return (
    <>
      <TableRow
        ref={setNodeRef}
        style={style}
        onClick={() => {
          if (!isDragging) {
            setOpen(!open);
          }
        }}
        className="bg-background! cursor-pointer select-none"
      >
        <TableCell colSpan={isWorklogUser ? 8 : 7} className="group relative px-2 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 pl-4">
              <button
                className="hover:text-primary absolute top-0 bottom-0 left-0 cursor-grab touch-none"
                {...attributes}
                {...listeners}
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical size={18} />
              </button>
              <ChevronRight
                size={14}
                className={`transition-transform ${open ? 'rotate-90' : ''}`}
              />
              <TaskType task={task} onTaskChange={onTaskChange} />
              {isEditing ? (
                <div
                  ref={inputRef}
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Input
                    className="bg-background h-7 w-[250px] border-none px-0 font-medium shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSave();
                      } else if (e.key === 'Escape') {
                        handleDiscard();
                      }
                    }}
                    autoFocus
                    disabled={isLoading}
                  />
                  <Button
                    className="h-7 w-7"
                    size="icon"
                    variant="ghost"
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Check size={13} />
                    )}
                  </Button>
                  <Button
                    className="h-7 w-7"
                    size="icon"
                    variant="ghost"
                    onClick={handleDiscard}
                    disabled={isLoading}
                  >
                    <X size={13} />
                  </Button>
                </div>
              ) : (
                <>
                  <span className="cursor-text text-base" onDoubleClick={handleTitleClick}>
                    {task.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                    className="h-5! w-5! opacity-0 group-hover:opacity-100 hover:bg-transparent hover:opacity-100"
                  >
                    <Edit2 size={10} className="text-muted-foreground size-3!" />
                  </Button>
                </>
              )}

              <Badge
                className={`py-0.5 text-xs font-normal ${STATUS_VARIANTS[getTaskStatus(task)]}`}
              >
                {getTaskStatus(task)}
              </Badge>
              {estimation ? (
                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                  {estimation} <span className="text-xs">hrs</span>
                </Badge>
              ) : null}
              {task.research && <ResearchSheet task={task} />}
              {task.id && (
                <Button
                  className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500"
                  size={'icon'}
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <Trash size={13} />
                </Button>
              )}
            </div>
            <MoveTaskButton task={task} onMove={onMove} />
          </div>
        </TableCell>
      </TableRow>
      {open && (task.description || !task.id) && (
        <TableRow className="bg-background! cursor-default border-none!">
          <TableCell colSpan={isWorklogUser ? 8 : 7} className="py-2 pl-14">
            {isEditingDesc ? (
              <div
                className="bg-muted/80 hover:bg-muted rounded-md p-2 transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                <div ref={descRef} className="flex flex-col">
                  <Textarea
                    className="text-muted-foreground resize-none border bg-transparent p-0 text-sm italic focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={editedDesc}
                    onChange={(e) => {
                      setEditedDesc(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        handleSaveDesc();
                      } else if (e.key === 'Escape') {
                        handleDiscardDesc();
                      }
                    }}
                    rows={3}
                    autoFocus
                    disabled={isLoading}
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      className="h-7 w-7"
                      size="icon"
                      variant="ghost"
                      onClick={handleSaveDesc}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Check size={13} />
                      )}
                    </Button>
                    <Button
                      className="h-7 w-7"
                      size="icon"
                      variant="ghost"
                      onClick={handleDiscardDesc}
                      disabled={isLoading}
                    >
                      <X size={13} />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="bg-muted/80 hover:bg-muted rounded-md p-2 transition-all"
                onDoubleClick={() => {
                  if (task.id) {
                    setIsEditingDesc(true);
                  }
                }}
              >
                <p className="text-muted-foreground line-clamp-6 text-sm text-wrap whitespace-pre-wrap italic">
                  {task.description ||
                    (task.title && `${task.title} description...`) ||
                    'Task description...'}
                </p>
              </div>
            )}
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default TaskRow;
