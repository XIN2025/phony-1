import { Bug, BugStatusType } from '@/types/bug';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import BugDrawer from './BugDrawer';
import { BugFilters } from './BugFilters';
import { BugsService } from '@/services/bugs.api';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import BugTableRow from './BugTableRow';
import { ProjectMember } from '@/types/project';
import { useSearchParams } from 'next/navigation';
import { useWorklog } from '@/contexts/worklog.context';

type BugsListProps = {
  bugs: Bug[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  setBugs: (bugs: Bug[]) => void;
  projectMembers: ProjectMember[];
  loading: boolean;
  refetch: (page?: number, limit?: number, status?: BugStatusType | null) => void;
};

const BugsList = ({
  bugs,
  pagination,
  loading,
  refetch,
  projectMembers,
  setBugs,
}: BugsListProps) => {
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const searchParams = useSearchParams();
  const isWorklogUser = useWorklog().isWorklogUser;
  const status = (searchParams.get('status') || null) as BugStatusType | null;

  const handleStatusChange = (type: BugStatusType | null) => {
    if (type) {
      window.history.replaceState({}, '', `${window.location.pathname}?status=${type || ''}`);
    } else {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  const handleBugStatusChange = async (bugId: string, newStatus: BugStatusType) => {
    try {
      const res = await BugsService.updateBugStatus(bugId, newStatus);
      if (res.data) {
        refetch(pagination.page, pagination.limit, status);
      } else {
        toast.error(res.error?.message);
      }
    } catch {
      toast.error('Failed to update bug status');
    }
  };
  const handleAssigneeChange = async (bugId: string, assigneeId: string | null) => {
    try {
      const res = await BugsService.updateBugAssignee(bugId, assigneeId);
      if (res.data) {
        refetch(pagination.page, pagination.limit, status);
      } else {
        toast.error(res.error?.message);
      }
    } catch {
      toast.error('Failed to assign bug');
    }
  };

  const handleConvertToTask = async (bugId: string) => {
    try {
      const res = await BugsService.convertToTask(bugId);
      if (res.data) {
        toast.success('Bug converted to task successfully');
        refetch(pagination.page, pagination.limit, status);
      } else {
        toast.error(res.error?.message);
      }
    } catch {
      toast.error('Failed to convert bug to task');
    }
  };

  const handleClick = (bugId: string) => {
    setSelectedBug(bugs.find((bug) => bug.id === bugId) ?? null);
    setIsDrawerOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="filters flex items-center justify-between">
        <BugFilters status={status} onStatusChange={handleStatusChange} />
      </div>
      <div className="rounded-md">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Title</TableHead>
              {isWorklogUser && <TableHead className="w-[140px] text-center"></TableHead>}
              <TableHead className="w-[140px] text-center">Status</TableHead>
              <TableHead className="w-[140px] text-center">Assignee</TableHead>
              <TableHead className="w-[140px] text-center">Created By</TableHead>
              <TableHead className="w-[120px] text-center">Created At</TableHead>
              <TableHead className="w-[100px] text-center">Attachments</TableHead>
              <TableHead className="w-[100px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-12" />
                    </TableCell>
                  </TableRow>
                ))
              : bugs.map((bug) => (
                  <BugTableRow
                    key={bug.id}
                    bug={bug}
                    onClick={() => {
                      handleClick(bug.id);
                      window.history.replaceState(
                        {},
                        '',
                        `${window.location.pathname}${status ? `?status=${status}&bugId=${bug.id}` : `?bugId=${bug.id}`}`,
                      );
                    }}
                    onStatusChange={handleBugStatusChange}
                    onConvertToTask={() => handleConvertToTask(bug.id)}
                    onAssign={handleAssigneeChange}
                    projectMembers={projectMembers}
                  />
                ))}
            {bugs.length === 0 && !loading && (
              <TableRow>
                <TableCell className="bg-background!" colSpan={7}>
                  <p className="text-muted-foreground text-center">No bugs found</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch(pagination.page - 1, pagination.limit, status)}
            disabled={pagination.page === 1 || loading}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <span className="text-muted-foreground text-sm">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch(pagination.page + 1, pagination.limit, status)}
            disabled={pagination.page === pagination.totalPages || loading}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="h-10"></div>
      <BugDrawer
        isLoading={loading}
        bug={selectedBug}
        isOpen={isDrawerOpen}
        projectMembers={projectMembers}
        onOpenChange={(bool) => {
          setIsDrawerOpen(bool);
          if (!bool) {
            setSelectedBug(null);
            window.history.replaceState(
              {},
              '',
              `${window.location.pathname}${status ? `?status=${status}` : ''}`,
            );
          }
        }}
        onDelete={() => refetch(pagination.page, pagination.limit, status)}
        onChange={(bug) => {
          setSelectedBug(bug);
          setBugs(bugs.map((b) => (b.id === bug.id ? bug : b)));
        }}
      />
    </div>
  );
};

export default BugsList;
