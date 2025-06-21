import { ClipboardList } from 'lucide-react';
import React from 'react';
import CreateSprintDialog from '../../CreateSprintDialog';
import posthog from 'posthog-js';
import AudioRecorder from '@/components/AudioRecorder';
import { Project, Sprint } from '@/types/project';

type Props = {
  project: Project;
  setSprints: React.Dispatch<React.SetStateAction<Sprint[]>>;
  setCurrentSprintId: React.Dispatch<React.SetStateAction<string | null>>;
};

const NoSprintComponent: React.FC<Props> = ({ project, setSprints, setCurrentSprintId }) => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 py-16">
      <div className="space-y-3 text-center">
        <div className="bg-primary/10 inline-block rounded-full p-4">
          <ClipboardList className="text-primary h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold">Start Planning Your Project</h2>
        <p className="text-muted-foreground mx-auto max-w-md">
          Create your first sprint to organize tasks and track progress. You can start directly or
          record a meeting first.
        </p>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <CreateSprintDialog
          onSuccess={(sprint) => {
            posthog.capture('create_sprint', {
              projectName: project.uniqueName,
            });
            setSprints((prevSprints) => [sprint, ...prevSprints]);
            setCurrentSprintId(sprint.id);
          }}
          project={project}
        />
        <AudioRecorder projectId={project.id} projectUniqueName={project.uniqueName} />
      </div>
    </div>
  );
};

export default NoSprintComponent;
