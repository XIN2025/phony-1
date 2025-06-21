'use client';

import { Button } from '@/components/ui/button';
import { BugStatusType } from '@/types/bug';

interface BugFiltersProps {
  status: BugStatusType | null;
  onStatusChange: (value: BugStatusType | null) => void;
}

export function BugFilters({ status, onStatusChange }: BugFiltersProps) {
  const currentValue = status || 'ALL';

  return (
    <div className="flex w-full flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex w-full flex-wrap justify-start gap-2 max-sm:gap-1 max-sm:text-sm sm:w-auto">
        <Button
          variant={currentValue === 'ALL' ? 'default' : 'outline'}
          size="sm"
          className="max-sm:text-xs"
          onClick={() => onStatusChange(null)}
        >
          All
        </Button>
        <Button
          variant={currentValue === 'OPEN' ? 'default' : 'outline'}
          size="sm"
          className="max-sm:text-xs"
          onClick={() => onStatusChange('OPEN')}
        >
          Open
        </Button>
        <Button
          variant={currentValue === 'IN_PROGRESS' ? 'default' : 'outline'}
          size="sm"
          className="max-sm:text-xs"
          onClick={() => onStatusChange('IN_PROGRESS')}
        >
          In Progress
        </Button>
        <Button
          variant={currentValue === 'FIXED' ? 'default' : 'outline'}
          size="sm"
          className="max-sm:text-xs"
          onClick={() => onStatusChange('FIXED')}
        >
          Fixed
        </Button>
        <Button
          variant={currentValue === 'CLOSED' ? 'default' : 'outline'}
          size="sm"
          className="max-sm:text-xs"
          onClick={() => onStatusChange('CLOSED')}
        >
          Closed
        </Button>
        <Button
          variant={currentValue === 'WORKING_AS_INTENDED' ? 'default' : 'outline'}
          size="sm"
          className="max-sm:text-xs"
          onClick={() => onStatusChange('WORKING_AS_INTENDED')}
        >
          Working as Intended
        </Button>
        <Button
          variant={currentValue === 'NEEDS_MORE_INFO' ? 'default' : 'outline'}
          size="sm"
          className="max-sm:text-xs"
          onClick={() => onStatusChange('NEEDS_MORE_INFO')}
        >
          Needs More Info
        </Button>
        <Button
          variant={currentValue === 'DEPRIOTISED' ? 'default' : 'outline'}
          size="sm"
          className="max-sm:text-xs"
          onClick={() => onStatusChange('DEPRIOTISED')}
        >
          Depriotised
        </Button>
      </div>
    </div>
  );
}
