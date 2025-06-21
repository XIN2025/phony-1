import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ProjectService } from '@/services';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Project } from '@/types/project';
import { Loader2 } from 'lucide-react';

interface ArchiveProjectProps {
  project: Project;
}

const ArchiveProject = ({ project }: ArchiveProjectProps) => {
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const router = useRouter();

  const handleArchiveProject = async () => {
    try {
      setIsArchiving(true);
      const response = project.isArchived
        ? await ProjectService.unarchiveProject(project.id)
        : await ProjectService.archiveProject(project.id);
      if (response?.data) {
        toast.success(
          project.isArchived ? 'Project unarchived successfully' : 'Project archived successfully',
        );
        router.refresh();
      } else {
        toast.error(response?.error?.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(project.isArchived ? 'Failed to unarchive project' : 'Failed to archive project');
    } finally {
      setIsArchiving(false);
      setShowArchiveDialog(false);
    }
  };

  return (
    <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
      <DialogTrigger asChild>
        <Button variant="outline">
          {project.isArchived ? 'Unarchive Project' : 'Archive Project'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {project.isArchived
              ? 'Are you sure you want to unarchive this project?'
              : 'Are you sure you want to archive this project?'}
          </DialogTitle>
          <DialogDescription>
            {project.isArchived
              ? 'This will make the project visible and accessible again.'
              : 'This will hide the project from the main dashboard but you can still access it later.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowArchiveDialog(false)}>
            Cancel
          </Button>
          <Button
            variant={project.isArchived ? 'default' : 'secondary'}
            onClick={handleArchiveProject}
            disabled={isArchiving}
          >
            {isArchiving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {project.isArchived ? 'Unarchiving...' : 'Archiving...'}
              </>
            ) : project.isArchived ? (
              'Unarchive Project'
            ) : (
              'Archive Project'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ArchiveProject;
