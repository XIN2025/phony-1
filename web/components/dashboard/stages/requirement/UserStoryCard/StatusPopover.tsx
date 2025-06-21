import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown, Loader2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';
import { UserStoryService } from '@/services';
import { UserStoriesDto } from '@/types/user-stories';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { STATUS_ICONS, STATUS_VARIANTS } from './constants';

type Props = {
  story: UserStoriesDto;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  onChangeStory: (story: UserStoriesDto) => void;
};

const StatusPopover = ({ story, showModal, setShowModal, onChangeStory }: Props) => {
  const [showStatusLoading, setShowStatusLoading] = useState(false);

  const handleStatusChange = async (status: string) => {
    try {
      setShowModal(false);
      setShowStatusLoading(true);

      const response = await UserStoryService.updateUserStories(story.id, {
        ...story,
        status: status,
        acceptanceCriteria:
          status === 'Done'
            ? story.acceptanceCriteria.map((c) => ({
                ...c,
                isCompleted: true,
              }))
            : story.acceptanceCriteria,
      });
      if (response.data) {
        onChangeStory(response.data);
      } else {
        toast.error(response.error.message);
      }
    } catch {
      toast.error('Failed to update status');
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
                className={`flex cursor-pointer items-center space-x-1 px-2 py-0.5 text-xs ${STATUS_VARIANTS[story.status]}`}
              >
                {STATUS_ICONS[story.status]}
                <span>{story.status}</span>
                <ChevronDown size={14} />
              </Badge>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] cursor-pointer p-0" align="end">
          {Object.keys(STATUS_ICONS).map((status) => (
            <div
              key={status}
              onClick={() => handleStatusChange(status)}
              className="hover:bg-accent flex items-center justify-between space-x-2 p-2"
            >
              <span
                className={`flex items-center space-x-2 rounded-2xl p-1 px-3 text-xs ${STATUS_VARIANTS[status]}`}
              >
                {STATUS_ICONS[status]}
                <span>{status}</span>
              </span>
              <Check
                className={cn(
                  'ml-auto h-4 w-4 transition-opacity',
                  story.status === status ? 'opacity-100' : 'opacity-0',
                )}
              />
            </div>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default StatusPopover;
