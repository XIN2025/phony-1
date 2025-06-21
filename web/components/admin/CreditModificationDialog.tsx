import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { AdminApi } from '@/services/admin.api';
import { isAxiosError } from 'axios';

interface CreditModificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  type: 'credits' | 'meeting_credits' | 'max_projects';
  action: 'add' | 'deduct';
  currentValue: number;
  onSuccess: () => void;
}

export function CreditModificationDialog({
  isOpen,
  onClose,
  userId,
  userName,
  type,
  action,
  onSuccess,
  currentValue,
}: CreditModificationDialogProps) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const getTitle = () => {
    if (type === 'max_projects') return `Edit Max Projects - ${userName}`;
    if (type === 'meeting_credits') {
      return `${action === 'add' ? 'Add' : 'Deduct'} Meeting Credits - ${userName}`;
    }
    return `${action === 'add' ? 'Add' : 'Deduct'} Credits - ${userName}`;
  };

  const handleSubmit = async () => {
    if (!value || isNaN(Number(value)) || Number(value) <= 0) {
      toast.error(
        `Please enter a valid ${type === 'max_projects' ? 'number' : 'number of credits'}`,
      );
      return;
    }

    try {
      setLoading(true);
      const numValue = Number(value);

      switch (type) {
        case 'credits':
          if (action === 'add') {
            const res = await AdminApi.addCreditsToUser(userId, numValue);
            if (res.data) {
              toast.success(`Successfully added ${value} credits to ${userName}`);
            } else {
              toast.error(res.error?.message);
            }
          } else {
            const res = await AdminApi.deductCreditsFromUser(userId, numValue);
            if (res.data) {
              toast.success(`Successfully deducted ${value} credits from ${userName}`);
            } else {
              toast.error(res.error?.message);
            }
          }
          break;

        case 'meeting_credits':
          if (action === 'add') {
            const res = await AdminApi.addMeetingCredits(userId, numValue);
            if (res.data) {
              toast.success(`Successfully added ${value} meeting credits to ${userName}`);
            } else {
              toast.error(res.error?.message);
            }
          } else {
            const res = await AdminApi.deductMeetingCredits(userId, numValue);
            if (res.data) {
              toast.success(`Successfully deducted ${value} meeting credits from ${userName}`);
            } else {
              toast.error(res.error?.message);
            }
          }
          break;

        case 'max_projects':
          const res = await AdminApi.updateMaxProjects(userId, numValue);
          if (res.data) {
            toast.success(`Successfully updated max projects to ${value} for ${userName}`);
          } else {
            toast.error(res.error?.message);
          }
          break;
      }

      onSuccess();
      onClose();
      setValue('');
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to modify value');
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to modify value');
      }
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (loading) return 'Processing...';
    if (type === 'max_projects') return 'Update Max Projects';
    return action === 'add' ? 'Add Credits' : 'Deduct Credits';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="text-muted-foreground text-sm">
            Current {type === 'max_projects' ? 'Max Projects' : 'Credits'}:{' '}
            {(currentValue ?? 0).toLocaleString()}
          </div>

          <Input
            type="number"
            placeholder={`Enter ${type === 'max_projects' ? 'max projects' : 'number of credits'}`}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            min="1"
          />
          {action === 'deduct' && type !== 'max_projects' && (
            <div className="text-muted-foreground text-xs">
              Note: Deducting more credits than the user has will set their credits to 0.
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={loading}>
            {getButtonText()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
