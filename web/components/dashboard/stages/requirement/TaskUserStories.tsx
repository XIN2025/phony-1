import { ReorderStoriesDto, TaskDto, UserStoriesDto } from '@/types/user-stories';
import React, { useEffect, useRef, useState } from 'react';
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
import UserStoryCard from './UserStoryCard';
import { ProjectMember } from '@/types/project';
import { TaskService, UserStoryService } from '@/services';
import { EventSource } from 'eventsource';
import { useSession } from 'next-auth/react';
import { AILoadingScreen } from '@/components/ui/AILoadingScreen';
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
import { toast } from 'sonner';
import posthog from 'posthog-js';
import { TableCell, TableRow } from '@/components/ui/table';
import { PlusIcon, Wand2 } from 'lucide-react';
import StoryCardHeader from './UserStoryCard/StoryCardHeader';
import TaskRow from './task/TaskRow';
import { useSearchParams } from 'next/navigation';
import { useWorklog } from '@/contexts/worklog.context';

type TaskUserStoriesProps = {
  task: TaskDto;
  projectId: string;
  onTaskChange: (task: TaskDto) => Promise<void>;
  onDelete: () => void;
  projectMembers: ProjectMember[];
  isOpen?: boolean;
};

const TaskUserStories = ({
  task,
  onTaskChange,
  projectMembers,
  projectId,
  onDelete,
  isOpen,
}: TaskUserStoriesProps) => {
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [tempStory, setTempStory] = useState<UserStoriesDto | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const searchParams = useSearchParams();
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
  const sseRef = useRef<EventSource | null>(null);
  const { data: session } = useSession();
  const fetchDataRef = useRef<() => EventSource | undefined>(undefined);
  const fetchData = (shouldCheckForStories = true) => {
    sseRef.current?.close();
    if (task.stories && task.stories.length && shouldCheckForStories) {
      setGenerating(false);
      setLoading(false);
      return;
    }

    const sse = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL}/tasks/story-status/${task.id}`,
      {
        withCredentials: true,
        fetch: (url, options) => {
          options.headers.Authorization = `Bearer ${session?.token}`;
          return fetch(url, options);
        },
      },
    );

    sseRef.current = sse;
    sse.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'generating') {
        setGenerating(true);
        setLoading(false);
        return;
      }
      if (data.type === 'success') {
        onTaskChange({
          ...task,
          stories: data.data.stories,
          research: data.data.research ?? task.research,
        });
        setGenerating(false);
      }
      if (data.type === 'error') {
        setGenerating(false);
      }
      setLoading(false);
      sse.close();
    };

    sse.onerror = (error) => {
      setLoading(false);
      setGenerating(false);
      console.error('EventSource failed:', error);
      sse.close();
    };

    return sse;
  };

  fetchDataRef.current = fetchData;

  const generateStories = async () => {
    posthog.capture('generate_stories', {
      user: session?.user?.email,
    });
    UserStoryService.generateUserStoriesForTask(task.id, projectId);
    setGenerating(true);
    setTimeout(() => {
      fetchData();
    }, 1000);
  };

  const regenerateStories = async () => {
    posthog.capture('regenerate_stories', {
      user: session?.user?.email,
    });
    UserStoryService.generateUserStoriesForTask(task.id, projectId);
    setGenerating(true);
    setTimeout(() => {
      fetchData(false);
    }, 2000);
  };

  useEffect(() => {
    const sse = fetchDataRef.current?.();
    return () => {
      sse?.close();
      sseRef.current?.close();
    };
  }, [task.id]);

  const handleDelete = async () => {
    try {
      const response = await TaskService.deleteTask(task.id);
      if (response.data) {
        onDelete();
        toast.success('Task deleted successfully');
        setShowDeleteDialog(false);
      } else {
        toast.error(response?.error?.message);
      }
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleCreateStory = async (newStory: UserStoriesDto) => {
    try {
      const response = await UserStoryService.createStory({
        title: newStory.title,
        description: newStory.title, // Setting description same as title by default
        projectId,
        taskId: task.id,
        sprintId: task.sprintId,
        estimation: 1, // Default estimation
        priority: 1, // Default priority
      });

      if (response?.data) {
        onTaskChange({
          ...task,
          stories: [...task.stories, response.data],
        });
        toast.success('Story created successfully');
      } else {
        toast.error(response?.error?.message);
      }
    } catch {
      toast.error('Failed to create story');
    }
    setTempStory(null);
  };

  const handleAddStory = () => {
    const newTempStory: UserStoriesDto = {
      id: '',
      title: '',
      description: '',
      status: 'Todo',
      priority: 1,
      estimation: 1,
      sprintId: task.sprintId,
      acceptanceCriteria: [],
      projectId: projectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTempStory(newTempStory);
  };

  const noStoryComponent = () => {
    if (loading) {
      return (
        <TableRow className="!bg-background">
          <TableCell colSpan={isWorklogUser ? 8 : 7}>
            <AILoadingScreen text="Loading stories" className="py-6" variant="minimal" />
          </TableCell>
        </TableRow>
      );
    }
    if (generating) {
      return (
        <TableRow className="!bg-background">
          <TableCell colSpan={isWorklogUser ? 8 : 7}>
            <AILoadingScreen text="AI is crafting user stories" className="pb-4" />
          </TableCell>
        </TableRow>
      );
    }
    if (!task.id) {
      return null;
    }
    return (
      <TableRow className="!bg-background">
        <TableCell colSpan={isWorklogUser ? 8 : 7} className="flex p-0 pl-11">
          <button
            className="text-muted-foreground flex w-fit items-center justify-center gap-1 px-3.5 py-2"
            onClick={(e) => {
              e.stopPropagation();
              handleAddStory();
            }}
          >
            <PlusIcon size={12} />
            <span className="text-xs hover:underline">Add SubTask...</span>
          </button>
          {!task.stories?.length ? (
            <button
              className="text-muted-foreground flex w-fit items-center justify-center gap-2 px-3 py-2 hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                generateStories();
              }}
            >
              <Wand2 className="h-3 w-3" />
              <span className="text-xs">Generate SubTasks...</span>
            </button>
          ) : (
            <button
              className="text-muted-foreground flex w-fit items-center justify-center gap-2 px-3 py-2 hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                onTaskChange({
                  ...task,
                  stories: [],
                });
                console.log('regenerating stories');
                regenerateStories();
              }}
            >
              <Wand2 className="h-3 w-3" />
              <span className="text-xs">Regenerate SubTasks...</span>
            </button>
          )}
        </TableCell>
      </TableRow>
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const storyId = searchParams.get('storyId');
      if (storyId) {
        const story = task.stories.find((s) => s.id === storyId);
        if (story) {
          onTaskChange({
            ...task,
            isOpen: true,
          });
        }
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [onTaskChange, searchParams, task]);

  return (
    <>
      <TaskRow
        open={isOpen || false}
        setOpen={() => {
          onTaskChange({
            ...task,
            isOpen: !task.isOpen,
          });
        }}
        task={task}
        onDelete={() => {
          setShowDeleteDialog(true);
        }}
        onTaskChange={onTaskChange}
        onMove={onDelete}
      />
      {isOpen && (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={async (event: DragEndEvent) => {
              const { active, over } = event;

              if (!over || active.id === over.id) {
                return;
              }

              setIsReordering(true);
              const oldIndex = task.stories.findIndex((s) => s.id === active.id);
              const newIndex = task.stories.findIndex((s) => s.id === over.id);

              const newStories = arrayMove(task.stories, oldIndex, newIndex);
              const newTask = { ...task, stories: newStories };
              onTaskChange(newTask);

              try {
                const reorderPayload: ReorderStoriesDto = newStories.map((story, index) => ({
                  storyId: story.id,
                  order: index,
                }));
                const response = await TaskService.reorderStories(reorderPayload);
                if (!response.data) {
                  toast.error('Failed to reorder stories');
                  onTaskChange(task); // Reset to original order on error
                }
              } catch {
                toast.error('Failed to reorder stories', {
                  description: 'Unknown error',
                });
                onTaskChange(task); // Reset to original order on error
              } finally {
                setIsReordering(false);
              }
            }}
          >
            <SortableContext
              items={task.stories.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {task.stories.map((story, index) => (
                <UserStoryCard
                  key={story.id || index}
                  story={story}
                  onChangeStory={(story) => {
                    const newTask = { ...task };
                    newTask.stories[index] = story;
                    onTaskChange(newTask);
                  }}
                  onDelete={() => {
                    const newTask = { ...task };
                    newTask.stories.splice(index, 1);
                    onTaskChange(newTask);
                  }}
                  projectMembers={projectMembers}
                  isReordering={isReordering}
                />
              ))}
            </SortableContext>
          </DndContext>

          {tempStory && (
            <StoryCardHeader
              story={tempStory}
              projectMembers={projectMembers}
              onChangeStory={handleCreateStory}
              setShowDeleteAlert={() => setTempStory(null)}
              isNew={true}
            />
          )}

          {noStoryComponent()}
        </>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will delete the task and all associated user stories. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TaskUserStories;
