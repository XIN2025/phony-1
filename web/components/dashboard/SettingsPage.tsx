'use client';
import { Project } from '@/types/project';
import { useState } from 'react';
import ProductBrief from './stages/ProductBrief';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Info, Loader2, Users, Sparkles, FileText, Activity } from 'lucide-react';
import MonitoringSettings from './settings/MonitoringSettings';
import ProjectMembers from './settings/ProjectMembers';
import ModelTypeSelector from './settings/ModelTypeSelector';
import ProjectContext from './settings/ProjectContext';
import { Button } from '../ui/button';
import { ProjectService } from '@/services';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { useSession } from 'next-auth/react';
import { FeatureFlag, useFeatureFlag } from '@/hooks/useFeatureFlags';
import ArchiveProject from './settings/ArchiveProject';

const SettingsPage = ({ project }: { project: Project }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [newProject, setNewProject] = useState<Project>(project);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmProjectName, setConfirmProjectName] = useState('');
  const isDeploymentEnabled = useFeatureFlag(FeatureFlag.DEPLOYMENT);
  const isDevelopmentEnabled = useFeatureFlag(FeatureFlag.DEVELOPMENT);
  const router = useRouter();
  const { data: session } = useSession();

  const handleDeleteProject = async () => {
    if (confirmProjectName !== project.title) {
      toast.error("Project name doesn't match");
      return;
    }

    try {
      setIsDeleting(true);
      const response = await ProjectService.deleteProject(project.id, session?.id || '');
      if (response?.data) {
        toast.success('Project deleted successfully');
        router.push('/dashboard');
      } else {
        toast.error('Failed to delete project');
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to delete project');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <Card className="mx-auto my-4 w-full max-w-4xl border-none p-1 shadow-none sm:p-8">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="flex h-auto w-fit flex-wrap items-center justify-start gap-1">
          <TabsTrigger value="details" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Project Details
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Members
          </TabsTrigger>
          {isDevelopmentEnabled && (
            <TabsTrigger value="model" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Model
            </TabsTrigger>
          )}
          {isDevelopmentEnabled && (
            <TabsTrigger value="context" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Context
            </TabsTrigger>
          )}
          {isDeploymentEnabled && (
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Monitoring
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="details" className="mt-6">
          <ProductBrief project={newProject} setProject={setNewProject} />
          {project.ownerId === session?.id && (
            <div className="mx-auto mt-8 flex gap-4">
              <ArchiveProject project={project} />
              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive">Delete Project</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure you want to delete this project?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. Please type &quot;{project.title}&quot; to
                      confirm.
                    </DialogDescription>
                  </DialogHeader>
                  <Input
                    value={confirmProjectName}
                    onChange={(e) => setConfirmProjectName(e.target.value)}
                    placeholder="Type project name to confirm"
                  />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteProject}
                      disabled={isDeleting || confirmProjectName !== project.title}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                        </>
                      ) : (
                        'Delete Project'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </TabsContent>
        <TabsContent value="members" className="mt-6">
          <ProjectMembers project={newProject} />
        </TabsContent>
        <TabsContent value="model" className="mt-6">
          <ModelTypeSelector
            project={newProject}
            onUpdate={(modelType) =>
              setNewProject({
                ...newProject,
                modelType,
              })
            }
          />
        </TabsContent>
        <TabsContent value="context" className="mt-6">
          <ProjectContext project={newProject} setProject={setNewProject} />
        </TabsContent>
        <TabsContent value="monitoring" className="mt-6">
          <MonitoringSettings project={newProject} setProject={setNewProject} />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default SettingsPage;
