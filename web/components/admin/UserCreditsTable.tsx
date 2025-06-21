'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileDown } from 'lucide-react';
import { ExportDateRangeDialog } from './ExportDateRangeDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowUp, ArrowDown, MoreVertical, Check, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { AdminApi } from '@/services/admin.api';
import { GetUserCreditsParams, UserCreditsResponse } from '@/types/admin';
import { CreditModificationDialog } from './CreditModificationDialog';
import { format } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';

interface SortButtonProps {
  label: string;
  sortKey: GetUserCreditsParams['sortBy'];
  currentSort: GetUserCreditsParams['sortBy'];
  currentOrder: GetUserCreditsParams['sortOrder'];
  onSort: (key: GetUserCreditsParams['sortBy']) => void;
}

function SortButton({ label, sortKey, currentSort, currentOrder, onSort }: SortButtonProps) {
  return (
    <Button variant="ghost" onClick={() => onSort(sortKey)} className="h-8 px-1 lg:px-3">
      {label}
      {currentSort === sortKey && (
        <span className="ml-2">
          {currentOrder === 'asc' ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
        </span>
      )}
    </Button>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex space-x-4">
          <div className="bg-muted h-12 w-full animate-pulse rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function UserCreditsTable() {
  const [data, setData] = useState<UserCreditsResponse | null>(null);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string;
    action: 'add' | 'deduct';
    type: 'credits' | 'meeting_credits' | 'max_projects';
    currentValue: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [params, setParams] = useState<GetUserCreditsParams>({
    page: 1,
    limit: 10,
    sortBy: 'credits_used',
    sortOrder: 'desc',
  });

  const debouncedSearch = useDebounce(search, 500);

  const fetchData = useCallback(async (newParams: GetUserCreditsParams) => {
    try {
      setLoading(true);
      const response = await AdminApi.getUserCredits(newParams);
      if (response.data) {
        setData(response.data);
      } else {
        toast.error(response.error.message);
      }
    } catch (error) {
      console.error('Error fetching user credits:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedSearch !== undefined) {
      setParams((prev) => ({ ...prev, search: debouncedSearch, page: 1 }));
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchData(params);
  }, [fetchData, params]);

  // Handle sort
  const handleSort = (sortBy: GetUserCreditsParams['sortBy']) => {
    const sortOrder =
      params.sortBy === sortBy && params.sortOrder === 'asc' ? ('desc' as const) : ('asc' as const);
    setParams((prev) => ({ ...prev, sortBy, sortOrder }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  return (
    <div className="border-none shadow-none">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExportDialog(true)}
            className="gap-2"
          >
            <FileDown className="h-4 w-4" />
            Export Users
          </Button>
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 max-w-sm"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Name</TableHead>
                <TableHead className="text-center">Email</TableHead>
                <TableHead className="text-center">Project Count</TableHead>
                <TableHead className="text-center">Max Projects</TableHead>
                <TableHead className="text-center">
                  <SortButton
                    label="Updated At"
                    sortKey="updated_at"
                    currentSort={params.sortBy}
                    currentOrder={params.sortOrder}
                    onSort={handleSort}
                  />
                </TableHead>
                <TableHead className="text-center">
                  <SortButton
                    label="Created At"
                    sortKey="created_at"
                    currentSort={params.sortBy}
                    currentOrder={params.sortOrder}
                    onSort={handleSort}
                  />
                </TableHead>
                <TableHead className="text-center">Waitlist Status</TableHead>
                <TableHead className="text-center">LinkedIn URL</TableHead>
                <TableHead className="text-center">
                  <SortButton
                    label="Credits Balance"
                    sortKey="credits_remaining"
                    currentSort={params.sortBy}
                    currentOrder={params.sortOrder}
                    onSort={handleSort}
                  />
                </TableHead>
                <TableHead className="text-center">
                  <SortButton
                    label="Credits Used"
                    sortKey="credits_used"
                    currentSort={params.sortBy}
                    currentOrder={params.sortOrder}
                    onSort={handleSort}
                  />
                </TableHead>
                <TableHead className="text-center">
                  <SortButton
                    label="Meeting Credits"
                    sortKey="meeting_credits_remaining"
                    currentSort={params.sortBy}
                    currentOrder={params.sortOrder}
                    onSort={handleSort}
                  />
                </TableHead>
                <TableHead className="text-center">
                  <SortButton
                    label="Meeting Credits Used"
                    sortKey="meeting_credits_used"
                    currentSort={params.sortBy}
                    currentOrder={params.sortOrder}
                    onSort={handleSort}
                  />
                </TableHead>
                <TableHead className="bg-background sticky right-0 text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading || !data ? (
                <TableRow>
                  <TableCell colSpan={9} className="p-4">
                    <TableSkeleton />
                  </TableCell>
                </TableRow>
              ) : data.users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center">
                    <p className="text-muted-foreground">No users found</p>
                  </TableCell>
                </TableRow>
              ) : (
                data.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-center">
                      {user.first_name} {user.last_name}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <span>{user.email}</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              {user.password ? (
                                user.is_verified ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <X className="h-4 w-4 text-red-500" />
                                )
                              ) : (
                                <Check className="h-4 w-4 text-green-500" />
                              )}
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {user.password
                                  ? user.is_verified
                                    ? 'Verified User'
                                    : 'Unverified User'
                                  : 'OAuth User'}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">{user.project_count ?? 1}</TableCell>
                    <TableCell className="text-center">{user.max_projects ?? 1}</TableCell>
                    <TableCell className="text-center">
                      {format(new Date(user.updated_at), 'MMM dd, yyyy hh:mm a')}
                    </TableCell>
                    <TableCell className="text-center">
                      {format(new Date(user.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.waitlist
                            ? user.waitlist.status === 'APPROVED'
                              ? 'bg-green-500/10 text-green-500'
                              : user.waitlist.status === 'REJECTED'
                                ? 'bg-red-500/10 text-red-500'
                                : 'bg-yellow-500/10 text-yellow-500'
                            : 'bg-gray-500/10 text-gray-500'
                        }`}
                      >
                        {user.waitlist ? user.waitlist.status : 'Not Joined'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {user.linkedin_profile_url ? (
                        <Link href={user.linkedin_profile_url} target="_blank">
                          View
                        </Link>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {(user.credits_remaining ?? 0)?.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      {(user.credits_used ?? 0)?.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      {(user.meeting_credits_remaining ?? 0)?.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      {(user.meeting_credits_used ?? 0)?.toLocaleString()}
                    </TableCell>
                    <TableCell className="bg-background sticky right-0 p-2 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              setSelectedUser({
                                id: user.id,
                                name: `${user.first_name} ${user.last_name}`,
                                action: 'add',
                                type: 'credits',
                                currentValue: user.credits_remaining ?? 0,
                              })
                            }
                          >
                            Add Credits
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setSelectedUser({
                                id: user.id,
                                name: `${user.first_name} ${user.last_name}`,
                                action: 'deduct',
                                type: 'credits',
                                currentValue: user.credits_remaining ?? 0,
                              })
                            }
                          >
                            Deduct Credits
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setSelectedUser({
                                id: user.id,
                                name: `${user.first_name} ${user.last_name}`,
                                action: 'add',
                                type: 'meeting_credits',
                                currentValue: user.meeting_credits_remaining ?? 0,
                              })
                            }
                          >
                            Add Meeting Credits
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setSelectedUser({
                                id: user.id,
                                name: `${user.first_name} ${user.last_name}`,
                                action: 'deduct',
                                type: 'meeting_credits',
                                currentValue: user.meeting_credits_remaining ?? 0,
                              })
                            }
                          >
                            Deduct Meeting Credits
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setSelectedUser({
                                id: user.id,
                                name: `${user.first_name} ${user.last_name}`,
                                action: 'add',
                                type: 'max_projects',
                                currentValue: user.max_projects ?? 1,
                              })
                            }
                          >
                            Edit Max Projects
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {data && (
          <div className="flex items-center justify-between space-x-2">
            <div className="text-muted-foreground text-sm">
              Showing {data.users.length} of {data.pagination.total} users
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(params.page! - 1)}
                disabled={params.page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(params.page! + 1)}
                disabled={params.page === data.pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
      {selectedUser && (
        <CreditModificationDialog
          isOpen={true}
          onClose={() => setSelectedUser(null)}
          userId={selectedUser.id}
          userName={selectedUser.name}
          type={selectedUser.type}
          action={selectedUser.action}
          currentValue={selectedUser.currentValue}
          onSuccess={() => {
            fetchData(params);
          }}
        />
      )}

      <ExportDateRangeDialog isOpen={showExportDialog} onClose={() => setShowExportDialog(false)} />
    </div>
  );
}
