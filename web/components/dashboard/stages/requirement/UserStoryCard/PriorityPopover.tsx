import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown, Loader2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';
import { UserStoryService } from '@/services';
import { UserStoriesDto } from '@/types/user-stories';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PRIORITY_VARIANTS } from './constants';

type Props = {
  story: UserStoriesDto;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  onChangeStory: (story: UserStoriesDto) => void;
};

const PriorityPopover = ({ story, showModal, setShowModal, onChangeStory }: Props) => {
  const [priorityLoading, setPriorityLoading] = useState(false);

  const handlePriorityChange = async (newPriority: number) => {
    try {
      setShowModal(false);
      setPriorityLoading(true);

      const response = await UserStoryService.updateUserStories(story.id, {
        ...story,
        priority: newPriority,
      });
      if (response.data) {
        onChangeStory(response.data);
      } else {
        toast.error(response.error.message);
      }
    } catch {
      toast.error('Failed to update priority');
    } finally {
      setPriorityLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center gap-2 max-md:hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <Popover open={showModal} onOpenChange={setShowModal}>
        <PopoverTrigger asChild>
          <div className="cursor-pointer">
            {priorityLoading ? (
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <Badge
                className={`${PRIORITY_VARIANTS[story.priority ?? 0]} flex items-center gap-1 px-3 py-0.5`}
              >
                P{story.priority ?? 0}
                <ChevronDown size={14} />
              </Badge>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          {[0, 1, 2, 3, 4, 5].map((p) => (
            <div
              key={p}
              onClick={() => handlePriorityChange(p)}
              className="hover:bg-accent flex cursor-pointer items-center justify-between space-x-2 p-2"
            >
              <div className="flex items-center gap-2">
                <Badge className={`${PRIORITY_VARIANTS[p]} flex items-center gap-1`}>P{p}</Badge>
                <span className="text-sm">
                  {p === 0
                    ? 'Critical'
                    : p === 1
                      ? 'High'
                      : p === 2
                        ? 'Medium High'
                        : p === 3
                          ? 'Medium'
                          : p === 4
                            ? 'Low'
                            : 'Lowest'}
                </span>
              </div>
              <Check
                className={cn(
                  'ml-auto h-4 w-4 transition-opacity',
                  story.priority === p ? 'opacity-100' : 'opacity-0',
                )}
              />
            </div>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default PriorityPopover;
