'use client';

import { useState, useMemo } from 'react';
import { WaitlistEntry } from '@/types/waitlist';
import { WaitlistService } from '@/services';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { toast } from 'sonner';

type SortDirection = 'asc' | 'desc';

export function WaitlistTable({
  entries,
  onUpdate,
}: {
  entries: WaitlistEntry[];
  onUpdate: () => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [fromFilter, setFromFilter] = useState<string>('');

  const uniqueFromValues = useMemo(() => {
    const values = new Set(entries.map((entry) => entry.from || 'manual'));
    return Array.from(values).sort();
  }, [entries]);

  const handleStatusUpdate = async (id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    try {
      setLoading(id);
      const res = await WaitlistService.updateStatus(id, status);
      if (res.data) {
        onUpdate();
        toast.success('Status updated successfully');
      } else {
        toast.error(res?.error?.message);
      }
    } catch {
      toast.error('Failed to update status');
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(id);
      const res = await WaitlistService.remove(id);
      if (res.data) {
        onUpdate();
        toast.success('Entry deleted successfully');
      } else {
        toast.error(res?.error?.message);
      }
    } catch {
      toast.error('Failed to delete entry');
    } finally {
      setLoading(null);
    }
  };

  const filteredAndSortedEntries = useMemo(() => {
    let filtered = [...entries];

    // Apply filters
    if (statusFilter) {
      filtered = filtered.filter((entry) => entry.status === statusFilter);
    }
    if (fromFilter) {
      filtered = filtered.filter((entry) =>
        (entry.from || 'manual').toLowerCase().includes(fromFilter.toLowerCase()),
      );
    }

    // Apply sorting for createdAt
    return filtered.sort((a, b) => {
      return sortDirection === 'asc'
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [entries, sortDirection, statusFilter, fromFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Status: {statusFilter || 'All'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter('')}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('PENDING')}>Pending</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('APPROVED')}>
              Approved
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('REJECTED')}>
              Rejected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Source: {fromFilter || 'All'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFromFilter('')}>All</DropdownMenuItem>
            {uniqueFromValues.map((value) => (
              <DropdownMenuItem key={value} onClick={() => setFromFilter(value)}>
                {value}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>From</TableHead>
              <TableHead>Status</TableHead>
              <TableHead
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
              >
                Created At{' '}
                {sortDirection === 'asc' ? (
                  <ChevronUp className="inline h-4 w-4" />
                ) : (
                  <ChevronDown className="inline h-4 w-4" />
                )}
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.name || '-'}</TableCell>
                <TableCell>{entry.email}</TableCell>
                <TableCell>{entry.from || 'manual'}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      entry.status === 'APPROVED'
                        ? 'bg-green-500/10 text-green-500'
                        : entry.status === 'REJECTED'
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-yellow-500/10 text-yellow-500'
                    }`}
                  >
                    {entry.status}
                  </span>
                </TableCell>
                <TableCell>{format(new Date(entry.created_at), 'MMM d, yyyy')}</TableCell>
                <TableCell className="w-[20%]">
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" disabled={loading === entry.id}>
                          Update Status
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(entry.id, 'PENDING')}>
                          Set as Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(entry.id, 'APPROVED')}>
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(entry.id, 'REJECTED')}>
                          Reject
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={loading === entry.id}>
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the waitlist
                            entry for {entry.email}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(entry.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
