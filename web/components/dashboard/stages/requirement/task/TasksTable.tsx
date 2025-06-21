import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { PlusIcon, Wand2 } from 'lucide-react';
import React, { useState, useCallback } from 'react';
import TaskUserStories from '../TaskUserStories';
import { ReorderTasksDto, TaskDto } from '@/types/user-stories';
import { ProjectMember } from '@/types/project';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import TaskRow from './TaskRow';
import { toast } from 'sonner';
import { TaskService } from '@/services';
import { useWorklog } from '@/contexts/worklog.context';

type Props = {
  tasks: TaskDto[];
  projectMembers: ProjectMember[];
  projectId: string;
  onTaskChange: (task: TaskDto[]) => void;
  generateTasks: () => void;
  handleCreateTask?: (task: {
    title: string;
    description: string;
    type: 'Feature' | 'Bug' | 'Research';
  }) => Promise<void>;
  requirements: string;
  isBacklog?: boolean;
};

const TasksTable: React.FC<Props> = ({
  tasks,
  projectMembers,
  projectId,
  onTaskChange,
  generateTasks,
  requirements,
  handleCreateTask,
  isBacklog,
}) => {
  const [tempTask, setTempTask] = useState<TaskDto | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const isWorklogUser = useWorklog().isWorklogUser;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        tolerance: 0,
        delay: 0,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = () => {
    // Close all tasks when dragging starts
    const newTasks = tasks.map((t) => ({
      ...t,
      isOpen: false,
    }));
    onTaskChange(newTasks);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setIsReordering(true);
    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);

    const newTasks = arrayMove(tasks, oldIndex, newIndex);
    onTaskChange(newTasks);

    try {
      const reorderPayload: ReorderTasksDto = newTasks.map((task, index) => ({
        taskId: task.id,
        order: index,
      }));
      const response = await TaskService.reorderTasks(reorderPayload);
      if (!response.data) {
        toast.error('Failed to reorder tasks');
        onTaskChange(tasks); // Reset to original order on error
      }
    } catch {
      toast.error('Failed to reorder tasks');
      onTaskChange(tasks); // Reset to original order on error
    } finally {
      setIsReordering(false);
    }
  };

  const handleAddTask = useCallback(() => {
    const newTempTask: TaskDto = {
      id: '',
      title: '',
      description: '',
      type: 'Feature',
      stories: [],
      sprintId: '',
      projectId: projectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTempTask(newTempTask);
  }, [projectId]);

  const handleTempTaskChange = useCallback(
    async (task: TaskDto) => {
      if (!task.title.trim()) return;
      if (handleCreateTask) {
        await handleCreateTask({
          title: task.title,
          description: task.title, // Setting description same as title by default
          type: 'Feature',
        });
      }
      setTempTask(null);
    },
    [handleCreateTask],
  );

  const handleTempTaskCancel = useCallback(() => {
    setTempTask(null);
  }, []);

  if (!tasks) return null;

  return (
    <div className="overflow-x-hidden">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Table className="overflow-x-hidden">
          <TableHeader className="border-b">
            <TableRow className="bg-muted/50">
              <TableHead className="h-10">Title</TableHead>
              {isWorklogUser && <TableHead className="h-10 w-28 text-center"></TableHead>}
              <TableHead className="h-10 w-28 text-center">Status</TableHead>
              <TableHead className="h-10 w-16 text-center">Priority</TableHead>
              <TableHead className="h-10 w-16 text-center">Estimate</TableHead>
              <TableHead className="h-10 w-16 text-center">Creator</TableHead>
              <TableHead className="h-10 w-16 text-center">Assignee</TableHead>
              <TableHead className="h-10 w-16 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody
            suppressHydrationWarning
            className={`${isReordering ? 'pointer-events-none opacity-60' : ''}`}
          >
            <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              {tasks?.map((task, index) => (
                <TaskUserStories
                  key={task.id || index}
                  task={task}
                  projectId={projectId}
                  onTaskChange={async (updatedTask) => {
                    const newTasks = [...tasks];
                    newTasks[index] = updatedTask;
                    onTaskChange(newTasks);
                  }}
                  onDelete={() => {
                    const newTasks = [...tasks];
                    newTasks.splice(index, 1);
                    onTaskChange(newTasks);
                  }}
                  projectMembers={projectMembers}
                  isOpen={task.isOpen}
                />
              ))}
            </SortableContext>
            {tempTask && (
              <TaskRow
                task={tempTask}
                open={false}
                setOpen={() => {}}
                onDiscard={handleTempTaskCancel}
                onDelete={handleTempTaskCancel}
                onTaskChange={handleTempTaskChange}
                isEditing={true}
                onMove={handleTempTaskCancel}
              />
            )}
            {tasks?.length === 0 && !tempTask && (
              <TableRow className="bg-background!">
                <TableCell colSpan={isWorklogUser ? 8 : 7} className="p-3 text-center">
                  No tasks found
                </TableCell>
              </TableRow>
            )}
            <TableRow className="bg-background!">
              <TableCell colSpan={isWorklogUser ? 8 : 7} className="flex p-0 pl-3">
                <button
                  className="text-foreground flex w-fit items-center justify-center gap-1 px-5 py-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddTask();
                  }}
                >
                  <PlusIcon size={12} />
                  <span className="text-sm hover:underline">Add Task...</span>
                </button>

                {!tasks?.length && !isBacklog && (
                  <button
                    className="flex w-fit items-center justify-center gap-2 px-5 py-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (requirements) {
                        generateTasks();
                      } else {
                        toast.error('Please add requirements to Sprint first');
                      }
                    }}
                  >
                    <Wand2 className="h-3 w-3" />
                    <span className="text-sm hover:underline">Generate Tasks</span>
                  </button>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </DndContext>
    </div>
  );
};

export default TasksTable;
