'use client';

import { Project } from '@/types/project';
import { ProjectService } from '@/services';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import MdxEditorComponent from '@/components/MdxEditor';

interface ProjectContextProps {
  project: Project;
  setProject: (project: Project) => void;
}

const ProjectContext = ({ project, setProject }: ProjectContextProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState(project.projectContext || '');

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await ProjectService.updateProject(project.id, {
        projectContext: context,
        thirdPartyIntegrations: project.thirdPartyIntegrations,
        clientRequirements: project.clientRequirements,
        title: project.title,
        designTheme: project.designTheme,
        docsContext: project.docsContext,
      });
      if (response.data) {
        toast.success('Project context updated successfully');
        setProject({
          ...project,
          projectContext: context,
        });
      } else {
        toast.error(response?.error?.message);
      }
    } catch (error) {
      console.error('Failed to update project context:', error);
      toast.error('Failed to update project context');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="max-sm:px-1">
        <CardTitle className="max-sm:text-xl">Project Context</CardTitle>
        <CardDescription>
          Document your project&apos;s architecture, technologies, and methodologies.
        </CardDescription>
      </CardHeader>
      <CardContent className="max-sm:px-1">
        <div className="space-y-4">
          <div className="max-h-[400px] overflow-y-auto rounded-lg border">
            <MdxEditorComponent markdown={context} onChange={(value) => setContext(value)} />
          </div>
          <Button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectContext;
