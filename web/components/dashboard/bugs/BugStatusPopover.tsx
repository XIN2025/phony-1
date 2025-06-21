import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, CheckCheckIcon, CheckIcon, ChevronDown, Loader2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bug, BugStatusType } from '@/types/bug';
import { AlertCircle, CheckCircle2, Clock, HelpCircle, XCircle } from 'lucide-react';

type Props = {
  bug: Bug;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  onStatusChange: (bugId: string, status: BugStatusType) => void;
};

const STATUS_ICONS = {
  OPEN: <AlertCircle className="h-3 w-3" />,
  FIXED: <CheckIcon className="h-3 w-3" />,
  CLOSED: <CheckCheckIcon className="h-3 w-3" />,
  IN_PROGRESS: <Clock className="h-3 w-3" />,
  WORKING_AS_INTENDED: <CheckCircle2 className="h-3 w-3" />,
  DEPRIOTISED: <XCircle className="h-3 w-3" />,
  NEEDS_MORE_INFO: <HelpCircle className="h-3 w-3" />,
};

const STATUS_VARIANTS = {
  OPEN: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
  FIXED: 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20',
  CLOSED: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  WORKING_AS_INTENDED: 'bg-neutral-500/10 text-neutral-500 hover:bg-neutral-500/20',
  DEPRIOTISED: 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20',
  NEEDS_MORE_INFO: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
};

const STATUS_LABELS = {
  OPEN: 'Open',
  FIXED: 'Fixed',
  CLOSED: 'Closed',
  WORKING_AS_INTENDED: 'Working as Intended',
  IN_PROGRESS: 'In Progress',
  DEPRIOTISED: 'Depriotised',
  NEEDS_MORE_INFO: 'Needs Info',
};

const BugStatusPopover = ({ bug, showModal, setShowModal, onStatusChange }: Props) => {
  const [showStatusLoading, setShowStatusLoading] = useState(false);

  const handleStatusChange = async (status: BugStatusType) => {
    try {
      setShowModal(false);
      setShowStatusLoading(true);
      await onStatusChange(bug.id, status);
    } catch {
      // Error is handled in the parent component
    } finally {
      setShowStatusLoading(false);
    }
  };

  const handlePopoverClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="flex items-center justify-center" onClick={handlePopoverClick}>
      <Popover open={showModal} onOpenChange={setShowModal}>
        <PopoverTrigger asChild>
          <div className="flex items-center space-x-1">
            {showStatusLoading ? (
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <Badge
                className={`flex cursor-pointer items-center space-x-1 px-2 py-0.5 text-xs ${STATUS_VARIANTS[bug.status]}`}
              >
                {STATUS_ICONS[bug.status]}
                <span className="text-nowrap">{STATUS_LABELS[bug.status]}</span>
                <ChevronDown size={14} />
              </Badge>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] cursor-pointer p-0" align="end">
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <div
              key={status}
              onClick={() => handleStatusChange(status as BugStatusType)}
              className="hover:bg-accent flex items-center justify-between space-x-2 p-2"
            >
              <span
                className={`flex items-center space-x-2 rounded-2xl p-1 px-3 text-xs ${
                  STATUS_VARIANTS[status as BugStatusType]
                }`}
              >
                {STATUS_ICONS[status as BugStatusType]}
                <span>{label}</span>
              </span>
              <Check
                className={cn(
                  'ml-auto h-4 w-4 transition-opacity',
                  bug.status === status ? 'opacity-100' : 'opacity-0',
                )}
              />
            </div>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default BugStatusPopover;
