'use client';
import { Project } from '@/types/project';
import { Bug } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import AddBugDialog from './AddBugDialog';
import BugsList from './BugsList';
import { BugStatusType, Bug as BugType } from '@/types/bug';
import { BugsService } from '@/services/bugs.api';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';

type ProjectBugsPageProps = {
  project: Project;
};

const ProjectBugsPage = ({ project }: ProjectBugsPageProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bugsData, setBugsData] = useState<{
    bugs: BugType[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }>({
    bugs: [],
    pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
  });
  const searchParams = useSearchParams();
  const status = (searchParams.get('status') || null) as BugStatusType | null;

  const fetchBugs = useCallback(
    async (page = 1, limit = 10, status?: BugStatusType | null) => {
      try {
        setLoading(true);
        const data = await BugsService.getBugs(project.id, { page, limit, status });
        if (data.data) {
          setBugsData(data.data);
        } else {
          toast.error(data.error.message);
        }
      } catch (error) {
        if (isAxiosError(error)) {
          toast.error(error.response?.data.message);
        } else {
          toast.error('Something went wrong');
        }
      } finally {
        setLoading(false);
      }
    },
    [project.id],
  );

  useEffect(() => {
    fetchBugs(1, 10, status);
  }, [status, fetchBugs]);

  return (
    <div className="mx-auto max-w-7xl p-2">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Bug className="text-primary h-5 w-5" />
            <h1 className="text-lg font-semibold">Project Bugs Tracker</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Track all the bugs and issues in your project
          </p>
        </div>
        <AddBugDialog
          open={open}
          setOpen={setOpen}
          projectId={project.id}
          onCreated={() => {
            setOpen(false);
            fetchBugs(1, 10, status);
          }}
        />
      </div>
      <div className="mt-5">
        <BugsList
          bugs={bugsData.bugs}
          pagination={bugsData.pagination}
          loading={loading}
          refetch={fetchBugs}
          projectMembers={project.projectMembers ?? []}
          setBugs={(newBugs) =>
            setBugsData((prev) => ({
              ...prev,
              bugs: newBugs,
            }))
          }
        />
      </div>
    </div>
  );
};

export default ProjectBugsPage;
