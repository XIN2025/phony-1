'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { DatePicker } from '@/components/DatePicker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AdminApi } from '@/services/admin.api';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';

interface ExportDateRangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportDateRangeDialog({ isOpen, onClose }: ExportDateRangeDialogProps) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!startDate || !endDate) return;

    try {
      setLoading(true);
      const res = await AdminApi.getUsersByDateRange(
        startDate.toISOString(),
        new Date(endDate.setHours(23, 59, 59, 999)).toISOString(),
      );
      if (res.error) {
        toast.error(res.error.message);
        return;
      }
      const data = res.data;

      const headers = ['First Name', 'Last Name', 'Email', 'Project Count', 'Created At', 'Status'];
      const csvContent = [
        headers.join(','),
        ...data.map((user) =>
          [
            user.first_name,
            user.last_name,
            user.email,
            user.project_count,
            format(user.created_at, 'dd-MM-yyyy'),
            user.status,
          ].join(','),
        ),
      ].join('\n');

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      saveAs(
        blob,
        `users-${format(startDate, 'yyyy-MM-dd')}-to-${format(endDate, 'yyyy-MM-dd')}.csv`,
      );
      onClose();
    } catch (error) {
      console.error('Error exporting users:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Export Users Data</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Date</label>
            <DatePicker date={startDate} onChange={setStartDate} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">End Date</label>
            <DatePicker date={endDate} onChange={setEndDate} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={!startDate || !endDate || loading}>
            {loading ? 'Exporting...' : 'Export'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
