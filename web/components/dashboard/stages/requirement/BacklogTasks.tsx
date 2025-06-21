'use client';
import { useCallback, useEffect, useState } from 'react';
import { ProjectMember } from '@/types/project';
import { TaskDto } from '@/types/user-stories';
import { AILoadingScreen } from '@/components/ui/AILoadingScreen';
import { TaskService } from '@/services';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

const TasksTable = dynamic(() => import('./task/TasksTable'), {
  ssr: false,
});
type Props = {
  projectId: string;
  projectMembers: ProjectMember[];
};

const mapToTask = (task: TaskDto) => {
  return {
    ...task,
    stories: task.stories.map((story) => {
      return {
        ...story,
        acceptanceCriteria: story.acceptanceCriteria.map((criteria) =>
          typeof criteria === 'string'
            ? {
                criteria: criteria,
                isCompleted: false,
              }
            : criteria,
        ),
      };
    }),
  };
};

const BacklogTasks = ({ projectId, projectMembers }: Props) => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<TaskDto[]>([]);

  const handleCreateTask = async (task: {
    title: string;
    description: string;
    type: 'Feature' | 'Bug' | 'Research';
  }) => {
    try {
      const response = await TaskService.createTask({
        ...task,
        projectId: projectId,
        sprintId: null, // Setting sprintId as null for backlog tasks
      });

      if (response?.data) {
        const newTasks = [...(tasks || []), response.data];
        setTasks(newTasks);
      } else {
        toast.error(response?.error?.message);
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const fetchBacklogTasks = useCallback(async () => {
    try {
      const response = await TaskService.getBacklogTasks(projectId);
      if (response?.data) {
        const mappedTasks = response.data.map(mapToTask);
        setTasks(mappedTasks);
      } else {
        toast.error(response?.error?.message);
      }
    } catch (error) {
      console.error('Error fetching backlog tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchBacklogTasks();
  }, [fetchBacklogTasks]);

  if (loading) {
    return <AILoadingScreen text="Loading Backlog" variant="minimal" className="py-10" />;
  }

  return (
    <TasksTable
      tasks={tasks}
      isBacklog={true}
      generateTasks={() => {}} // Backlog doesn't need generate functionality
      onTaskChange={(newTasks) => {
        setTasks(newTasks);
      }}
      requirements="" // Backlog doesn't need requirements
      projectId={projectId}
      projectMembers={projectMembers}
      handleCreateTask={handleCreateTask}
    />
  );
};

export default BacklogTasks;
