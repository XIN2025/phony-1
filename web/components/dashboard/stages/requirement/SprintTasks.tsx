'use client';
import { useEffect, useRef, useState } from 'react';
import { EventSource } from 'eventsource';
import { ProjectMember, Sprint } from '@/types/project';
import { TaskDto } from '@/types/user-stories';
import { AILoadingScreen } from '@/components/ui/AILoadingScreen';
import { TaskService } from '@/services';
import posthog from 'posthog-js';
import dynamic from 'next/dynamic';
import { Session } from 'next-auth';

const TasksTable = dynamic(() => import('./task/TasksTable'), {
  ssr: false,
});

type Props = {
  sprint: Sprint;
  projectMembers: ProjectMember[];
  session: Session;
  onTaskChange: (task: TaskDto[]) => void;
  handleCreateTask?: (task: {
    title: string;
    description: string;
    type: 'Feature' | 'Bug' | 'Research';
  }) => Promise<void>;
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

const SprintTasks = ({
  sprint,
  session,
  onTaskChange,
  projectMembers,
  handleCreateTask,
}: Props) => {
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const sseRef = useRef<EventSource | null>(null);
  const fetchDataRef = useRef<() => EventSource | undefined>(undefined);

  const handleData = (data: TaskDto[]) => {
    setGenerating(false);
    const tasks = data?.map((task: TaskDto) => {
      return mapToTask(task);
    });
    onTaskChange(tasks);
  };

  const fetchData = () => {
    sseRef.current?.close();
    if (sprint?.tasks && sprint.tasks.length) {
      setGenerating(false);
      setLoading(false);
      return;
    }

    const sse = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL}/tasks/task-status/${sprint.id}`,
      {
        withCredentials: true,
        fetch: (url, options) => {
          options.headers.Authorization = `Bearer ${session.token}`;
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
        handleData(data.data);
      }
      if (data.type === 'error') {
        setGenerating(false);
      }
      setLoading(false);
      sse.close();
    };

    sse.onerror = () => {
      setLoading(false);
      setGenerating(false);
      sse.close();
    };

    return sse;
  };

  fetchDataRef.current = fetchData;

  const generateTasks = () => {
    posthog.capture('generate_tasks', {
      user: session?.user?.email,
    });
    TaskService.generateTasksForSprint(sprint.id, sprint.projectId);
    setGenerating(true);
    setTimeout(() => {
      fetchData();
    }, 1000);
  };

  useEffect(() => {
    setLoading(true);
    const sse = fetchDataRef.current?.();
    return () => {
      sse?.close();
      sseRef.current?.close();
    };
  }, [sprint.id]);

  if (loading) {
    return <AILoadingScreen text="Loading Requirements" variant="minimal" className="py-10" />;
  }

  if (generating) {
    return <AILoadingScreen text="AI is crafting Requirements" />;
  }

  return (
    <div className="mx-2 mt-2 flex-1 overflow-y-auto">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="px-1 text-lg font-medium">Tasks</h2>
      </div>
      <TasksTable
        tasks={sprint.tasks}
        generateTasks={generateTasks}
        onTaskChange={onTaskChange}
        requirements={sprint.requirements}
        projectId={sprint.projectId}
        projectMembers={projectMembers}
        handleCreateTask={handleCreateTask}
      />
      <div className="h-10"></div>
    </div>
  );
};

export default SprintTasks;
