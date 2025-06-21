import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown, Loader2Icon } from 'lucide-react';
import React from 'react';
import { SPRINT_STATUS_ICONS, SPRINT_STATUS_VARIANTS } from './constants';
import { cn } from '@/lib/utils';
import { Sprint } from '@/types/project';
import { ProjectService } from '@/services';
import { toast } from 'sonner';

type Props = {
  currentSprint: Sprint;
  setSprints: React.Dispatch<React.SetStateAction<Sprint[]>>;
};

const SprintStatusPopover = ({ currentSprint, setSprints }: Props) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="flex items-center space-x-1">
          {isUpdatingStatus ? (
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                <Loader2Icon className="h-4 w-4 animate-spin" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <Badge
              className={`flex cursor-pointer items-center space-x-1 px-2 py-0.5 text-xs whitespace-nowrap ${
                SPRINT_STATUS_VARIANTS[currentSprint.status || 'NotStarted']
              }`}
            >
              {React.createElement(SPRINT_STATUS_ICONS[currentSprint.status || 'NotStarted'], {
                size: 14,
              })}
              <span>
                {currentSprint.status === 'NotStarted' ? 'Not Started' : currentSprint.status}
              </span>
              <ChevronDown size={14} />
            </Badge>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] cursor-pointer p-0" align="end">
        {Object.keys(SPRINT_STATUS_ICONS).map((status) => (
          <div
            key={status}
            onClick={async () => {
              try {
                setIsUpdatingStatus(true);
                setOpen(false);
                const response = await ProjectService.updateSprint(currentSprint.id, {
                  status,
                });
                if (response?.data) {
                  setSprints((prevSprints) =>
                    prevSprints.map((sprint) => {
                      if (sprint.id === currentSprint.id) {
                        return {
                          ...sprint,
                          status,
                        };
                      }
                      return sprint;
                    }),
                  );
                  toast.success('Sprint status updated successfully');
                } else {
                  toast.error(response?.error?.message);
                }
              } catch {
                toast.error('Failed to update sprint status');
              } finally {
                setIsUpdatingStatus(false);
              }
            }}
            className="hover:bg-accent flex items-center justify-between space-x-2 p-2"
          >
            <span
              className={`flex items-center space-x-2 rounded-2xl p-1 px-3 text-xs ${SPRINT_STATUS_VARIANTS[status]}`}
            >
              {React.createElement(SPRINT_STATUS_ICONS[status], { size: 14 })}
              <span>{status === 'NotStarted' ? 'Not Started' : status}</span>
            </span>
            <Check
              className={cn(
                'ml-auto h-4 w-4 transition-opacity',
                currentSprint.status === status ? 'opacity-100' : 'opacity-0',
              )}
            />
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
};

export default SprintStatusPopover;
