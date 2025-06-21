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
} from '@/components/ui/alert-dialog';
import { TaskDto } from '@/types/user-stories';
import { TaskService } from '@/services';
import { ArrowLeftRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface MoveTaskButtonProps {
  task: TaskDto;
  onMove: () => void;
}

export const MoveTaskButton = ({ task, onMove }: MoveTaskButtonProps) => {
  const [isMoving, setIsMoving] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleMove = async () => {
    try {
      setIsMoving(true);
      const res = task.sprintId
        ? await TaskService.moveTaskToBacklog(task.id)
        : await TaskService.moveTaskToSprint(task.id);

      if (res?.data) {
        onMove();
        toast.success('Success', {
          description: task.sprintId ? 'Task moved to backlog' : 'Task moved to sprint',
        });
      } else {
        toast.error(res?.error?.message);
      }
    } catch {
      toast.error('Error', {
        description: 'Failed to move task',
      });
    } finally {
      setIsMoving(false);
    }
  };

  if (!task.id) return null;

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Button
        className="hover:bg-muted h-7 w-7"
        size="icon"
        variant="ghost"
        onClick={() => {
          setIsDialogOpen(true);
        }}
        disabled={isMoving}
      >
        <ArrowLeftRight size={13} className="text-primary" />
      </Button>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to move this task to{' '}
              {task.sprintId ? 'backlog' : 'current sprint'}?
              {task.sprintId
                ? ' This will remove the task from the current sprint.'
                : ' This will add the task to the current sprint.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async (e) => {
                e.preventDefault();
                await handleMove();
                setIsDialogOpen(false);
              }}
              disabled={isMoving}
            >
              {isMoving ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Moving...
                </div>
              ) : (
                'Move Task'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
