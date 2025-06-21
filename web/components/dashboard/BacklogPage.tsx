import { Project } from '@/types/project';
import BacklogTasks from './stages/requirement/BacklogTasks';
import { ListTodo } from 'lucide-react';

interface BacklogPageProps {
  initialProject: Project;
}

export default function BacklogPage({ initialProject }: BacklogPageProps) {
  return (
    <div className="container mx-auto flex flex-col px-4 py-6">
      <div className="mb-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <ListTodo className="text-primary h-5 w-5" />
            <h1 className="text-lg font-semibold">{initialProject.title} - Backlog</h1>
          </div>
          <p className="text-muted-foreground text-sm">Manage your project&apos;s backlog tasks</p>
        </div>
      </div>
      <BacklogTasks
        projectId={initialProject.id}
        projectMembers={initialProject.projectMembers ?? []}
      />
    </div>
  );
}
