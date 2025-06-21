import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import React from 'react';
import { BugForm } from './BugForm';

type AddBugDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  projectId: string;
  onCreated: () => void;
};

const AddBugDialog = ({ open, setOpen, projectId, onCreated }: AddBugDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 max-sm:hidden">
          <Plus className="h-4 w-4" /> Add Bug
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Bug</DialogTitle>
        </DialogHeader>
        <div>
          <BugForm projectId={projectId} onCreated={onCreated} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddBugDialog;
