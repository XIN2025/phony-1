'use client';
import { Project, Sprint } from '@/types/project';
import SprintTasks from './SprintTasks';
import { TaskService } from '@/services';
import { toast } from 'sonner';
import React, { useState } from 'react';
import LoadingScreen from '@/components/LoadingScreen';
import SprintHeader from './sprint/SprintHeader';
import NoSprintComponent from './sprint/NoSprintComponent';
import { Session } from 'next-auth';

type Props = {
  project: Project;
  session: Session;
  sprints: Sprint[];
  setSprints: React.Dispatch<React.SetStateAction<Sprint[]>>;
};

const UserStories = ({ project, session, sprints, setSprints }: Props) => {
  const projectMembers = project.projectMembers?.filter((pm) => pm.userId) ?? [];

  const [currentSprintId, setCurrentSprintId] = useState<string | null>(sprints.at(0)?.id ?? null);
  const currentSprint = sprints.find((sprint) => sprint.id === currentSprintId);

  const handleCreateTask = async (body: {
    title: string;
    description: string;
    type: 'Feature' | 'Bug' | 'Research';
  }) => {
    if (!currentSprint) {
      return;
    }
    try {
      const res = await TaskService.createTask({
        sprintId: currentSprint.id,
        projectId: currentSprint.projectId,
        ...body,
      });
      if (res && res.data) {
        const newSprints = sprints.map((sprint) => {
          if (sprint.id === currentSprint.id) {
            return {
              ...sprint,
              tasks: [...sprint.tasks, res.data],
            };
          }
          return sprint;
        });
        setSprints(newSprints);
        toast.success('Task created successfully');
      } else {
        toast.error('Failed to create task');
      }
    } catch {
      toast.error('Failed to create task');
    }
  };

  if (!sprints.length) {
    return (
      <NoSprintComponent
        setCurrentSprintId={setCurrentSprintId}
        project={project}
        setSprints={setSprints}
      />
    );
  }

  if (!currentSprint) {
    return <LoadingScreen type="logo" />;
  }

  return (
    <div className="flex h-full flex-col">
      <SprintHeader
        project={project}
        sprints={sprints}
        setCurrentSprintId={setCurrentSprintId}
        currentSprint={currentSprint}
        setSprints={setSprints}
      />

      <SprintTasks
        onTaskChange={(tasks) => {
          const newSprints = sprints.map((sprint) => {
            if (sprint.id === currentSprint.id) {
              return {
                ...sprint,
                tasks,
              };
            }
            return sprint;
          });
          setSprints(newSprints);
        }}
        sprint={currentSprint}
        session={session}
        projectMembers={projectMembers}
        handleCreateTask={handleCreateTask}
      />
    </div>
  );
};

export default UserStories;
