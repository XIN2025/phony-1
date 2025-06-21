'use client';

import { useState, useEffect, useMemo } from 'react';
import { WaitlistEntry } from '@/types/waitlist';
import { WaitlistService } from '@/services';
import { WaitlistTable } from '@/components/dashboard/waitlist/WaitlistTable';
import { CreateWaitlistDialog } from '@/components/dashboard/waitlist/CreateWaitlistDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { UserPlus, Search } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { ExportWaitlistDialog } from '@/components/dashboard/waitlist/ExportWaitlistDialog';

interface WaitlistClientProps {
  initialEntries: WaitlistEntry[];
}

export function WaitlistClient({ initialEntries }: WaitlistClientProps) {
  const [entries, setEntries] = useState<WaitlistEntry[]>(initialEntries);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const data = await WaitlistService.getAll();
      if (data.data) {
        setEntries(data.data);
        setError(null);
      } else {
        setError(data.error.message);
      }
    } catch {
      setError('Failed to fetch waitlist entries');
    } finally {
      setLoading(false);
    }
  };

  // Filter entries based on search term
  const filteredEntries = useMemo(() => {
    if (!searchTerm.trim()) return entries;

    const searchTermLower = searchTerm.toLowerCase();
    return entries.filter((entry) => {
      const nameMatch = entry.name ? entry.name.toLowerCase().includes(searchTermLower) : false;
      const emailMatch = entry.email.toLowerCase().includes(searchTermLower);
      const fromMatch = entry.from ? entry.from.toLowerCase().includes(searchTermLower) : false;
      const statusMatch = entry.status.toLowerCase().includes(searchTermLower);

      return nameMatch || emailMatch || fromMatch || statusMatch;
    });
  }, [entries, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const paginatedEntries = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEntries.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEntries, currentPage, itemsPerPage]);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages are less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);

      // Calculate start and end of middle pages
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're near the beginning
      if (currentPage <= 3) {
        endPage = Math.min(totalPages - 1, 4);
      }

      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 3);
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push('ellipsis1');
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push('ellipsis2');
      }

      // Always show last page
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <div className="mx-auto max-w-6xl py-10">
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 p-2 pb-6">
          <div>
            <CardTitle className="my-1 flex items-center text-xl font-semibold max-sm:text-lg">
              <UserPlus className="text-primary mr-2 h-5 w-5" />
              Waitlist Management
            </CardTitle>
            <CardDescription className="text-base max-sm:text-sm">
              Manage user waitlist entries and their approval status
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <ExportWaitlistDialog entries={entries} />
            <CreateWaitlistDialog onSuccess={fetchEntries} />
          </div>
        </CardHeader>
        <CardContent className="p-2">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? (
            <div className="py-4 text-center">
              <p className="text-red-500">{error}</p>
              <button
                onClick={fetchEntries}
                className="mt-2 text-sm text-blue-500 hover:text-blue-600"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center">
                <div className="relative w-full max-w-sm">
                  <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search by name, email, source or status..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="text-muted-foreground ml-auto text-sm">
                  {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}{' '}
                  found
                </div>
              </div>

              {filteredEntries.length === 0 ? (
                <div className="text-muted-foreground py-8 text-center">
                  <p>No matching entries found.</p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="mt-2 text-sm text-blue-500 hover:text-blue-600"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                <div className="[&_td]:py-2 [&_th]:py-2">
                  <WaitlistTable entries={paginatedEntries} onUpdate={fetchEntries} />
                </div>
              )}

              {totalPages > 1 && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>

                    {getPageNumbers().map((page, index) => (
                      <PaginationItem key={`page-${index}`}>
                        {page === 'ellipsis1' || page === 'ellipsis2' ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            className="cursor-pointer"
                            isActive={currentPage === page}
                            onClick={() => setCurrentPage(Number(page))}
                          >
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        className={
                          currentPage === totalPages ? 'pointer-events-none opacity-50' : ''
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
