import { useState } from 'react';
import { Loader2, PlusIcon } from 'lucide-react';
import { EnvironmentListItem } from '@/types/secrets';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

interface EnvironmentSelectorProps {
  environments: EnvironmentListItem[];
  selectedEnv: string;
  onEnvironmentChange: (value: string) => void;
  onCreateEnvironment: (name: string) => Promise<void>;
  isLoading: boolean;
  isCreating?: boolean;
  isAdmin: boolean;
}

export function EnvironmentSelector({
  environments,
  selectedEnv,
  onEnvironmentChange,
  onCreateEnvironment,
  isLoading,
  isCreating = false,
  isAdmin,
}: EnvironmentSelectorProps) {
  const [showNewEnvDialog, setShowNewEnvDialog] = useState(false);
  const [newEnvName, setNewEnvName] = useState('');

  const handleCreateEnvironment = async () => {
    if (!newEnvName) return;
    await onCreateEnvironment(newEnvName);
    setShowNewEnvDialog(false);
    setNewEnvName('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Select value={selectedEnv} onValueChange={onEnvironmentChange}>
        <SelectTrigger className="h-9 w-[200px]">
          <SelectValue placeholder="Select environment" />
        </SelectTrigger>
        <SelectContent>
          {environments.map((env) => (
            <SelectItem key={env.id} value={env.id}>
              {env.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isAdmin && (
        <Dialog open={showNewEnvDialog} onOpenChange={setShowNewEnvDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="hover:bg-primary h-9 w-9 hover:text-white"
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Create New Environment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Environment Name"
                value={newEnvName}
                onChange={(e) => setNewEnvName(e.target.value)}
                className="focus-visible:ring-primary"
              />
              <DialogFooter>
                <Button
                  type="submit"
                  className="gap-2"
                  disabled={!newEnvName || isCreating}
                  onClick={handleCreateEnvironment}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Environment'
                  )}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
