import React, { useState, useEffect } from 'react';
import { WorklogDto, UpdateWorklogDto } from '@/types/worklog';
import { WorklogService } from '@/services/worklog.api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/DatePicker';
import { Loader2 } from 'lucide-react';

interface WorklogEditDialogProps {
  worklog: WorklogDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedWorklog: WorklogDto) => void;
}

export const WorklogEditDialog: React.FC<WorklogEditDialogProps> = ({
  worklog,
  open,
  onOpenChange,
  onUpdate,
}) => {
  const [date, setDate] = useState<Date>(new Date(worklog.date));
  const [hoursWorked, setHoursWorked] = useState<string>(worklog.hoursWorked.toString());
  const [description, setDescription] = useState<string>(worklog.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDate(new Date(worklog.date));
      setHoursWorked(worklog.hoursWorked.toString());
      setDescription(worklog.description || '');
      setError(null);
    }
  }, [open, worklog]);

  const handleSave = async () => {
    const hours = parseFloat(hoursWorked);

    if (isNaN(hours) || hours <= 0) {
      setError('Please enter a valid number of hours');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updateData: UpdateWorklogDto = {
        date: date.toISOString(),
        hoursWorked: hours,
        description: description.trim() || undefined,
      };
      const res = await WorklogService.updateWorklog(worklog.id, updateData);
      if (res.data) {
        onUpdate({ ...worklog, ...updateData });
        onOpenChange(false);
      }
    } catch (err) {
      setError('Failed to update worklog');
      console.error('Error updating worklog:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Worklog</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <DatePicker
              date={date}
              maxDate={new Date()}
              onChange={(newDate) => newDate && setDate(newDate)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hours">Hours Worked</Label>
            <Input
              id="hours"
              type="number"
              min="0.1"
              step="0.5"
              value={hoursWorked}
              onChange={(e) => setHoursWorked(e.target.value)}
              placeholder="e.g. 2.5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description of the work done..."
              rows={3}
            />
          </div>

          {error && (
            <div className="border-destructive/20 bg-destructive/10 rounded-lg border p-3">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
