'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Download } from 'lucide-react';
import { WaitlistEntry } from '@/types/waitlist';
import { saveAs } from 'file-saver';

interface ExportWaitlistDialogProps {
  entries: WaitlistEntry[];
}

export function ExportWaitlistDialog({ entries }: ExportWaitlistDialogProps) {
  const [status, setStatus] = useState<string>('All');
  const [from, setFrom] = useState<string>('All');
  const uniqueFromValues = useMemo(() => {
    const values = entries.map((entry) => entry.from ?? 'manual');
    return Array.from(new Set(values)).sort();
  }, [entries]);
  const [open, setOpen] = useState(false);

  const filterEntries = () => {
    return entries.filter((entry) => {
      const matchesStatus = !status || status === 'All' || entry.status === status;
      const matchesFrom = !from || from === 'All' || entry.from === from;
      return matchesStatus && matchesFrom;
    });
  };

  const exportToCSV = () => {
    const filteredEntries = filterEntries();
    const headers = ['Name', 'Email', 'From', 'Status', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...filteredEntries.map((entry) =>
        [
          entry.name || '',
          entry.email,
          entry.from || '',
          entry.status,
          new Date(entry.created_at).toISOString(),
        ].join(','),
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `waitlist-export-${new Date().toISOString().split('T')[0]}.csv`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Waitlist Data</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>From</Label>
            <Select value={from} onValueChange={setFrom}>
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                {uniqueFromValues.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={exportToCSV}>Download CSV</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
