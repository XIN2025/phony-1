import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { useProjectStore } from '@/stores/useProjectStore';

type MoveToProjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMoveToProject: (meetingId: string, projectId: string) => Promise<void>;
  meetingId: string;
  projectId?: string | null;
};

const MoveToProjectDialog = ({
  open,
  onOpenChange,
  onMoveToProject,
  meetingId,
  projectId,
}: MoveToProjectDialogProps) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isMoving, setIsMoving] = useState(false);
  const { projects, loading } = useProjectStore();

  const handleMove = async () => {
    if (!selectedProjectId) return;

    try {
      setIsMoving(true);
      await onMoveToProject(meetingId, selectedProjectId);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to move meeting:', error);
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move to Project</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <Select
            value={selectedProjectId}
            onValueChange={setSelectedProjectId}
            disabled={loading || isMoving}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects
                .filter((project) => project.id !== projectId)
                .map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isMoving}>
            Cancel
          </Button>
          <Button onClick={handleMove} disabled={!selectedProjectId || isMoving}>
            {isMoving ? 'Moving...' : 'Move'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MoveToProjectDialog;
