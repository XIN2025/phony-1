import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Check, Loader2Icon } from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';
import { UserStoryService } from '@/services';
import { UserStoriesDto } from '@/types/user-stories';
import { ProjectMember } from '@/types/project';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type Props = {
  story: UserStoriesDto;
  projectMembers: ProjectMember[];
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  onChangeStory: (story: UserStoriesDto) => void;
};

const AssigneePopover = ({
  story,
  projectMembers,
  showModal,
  setShowModal,
  onChangeStory,
}: Props) => {
  const [assigneeLoading, setAssigneeLoading] = useState(false);

  const handleAssignUser = async (member: ProjectMember) => {
    try {
      setShowModal(false);
      setAssigneeLoading(true);
      let assignedTo = member.userId;
      if (story.assignedTo === member.userId) {
        assignedTo = undefined;
      }

      const response = await UserStoryService.updateUserStories(story.id, {
        ...story,
        assignedTo: assignedTo,
      });
      if (response.data) {
        toast.success('User assigned successfully');
        onChangeStory(response.data);
      } else {
        toast.error(response.error.message);
      }
    } catch {
      toast.error('Failed to assign user');
    } finally {
      setAssigneeLoading(false);
    }
  };

  const handlePopoverClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="flex items-center justify-center" onClick={handlePopoverClick}>
      <Popover open={showModal} onOpenChange={setShowModal}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger onClick={(e) => e.stopPropagation()} asChild>
              <div className="flex cursor-pointer items-center">
                {assigneeLoading ? (
                  <div className="bg-muted flex h-7 w-7 items-center justify-center rounded-full border">
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  </div>
                ) : story.assignee ? (
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={story.assignee?.avatarUrl} />
                    <AvatarFallback>
                      {story.assignee?.firstName?.slice(0, 2)?.toUpperCase() ?? 'OG'}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="bg-muted flex h-7 w-7 items-center justify-center rounded-full border">
                    <span className="text-center">UN</span>
                  </div>
                )}
              </div>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            {story.assignee
              ? `Assigned to ${story.assignee.firstName} ${story.assignee.lastName}`
              : 'Unassigned'}
          </TooltipContent>
        </Tooltip>
        <PopoverContent onClick={(e) => e.stopPropagation()} className="w-[300px] p-0" align="end">
          <Command>
            <CommandInput placeholder="Search users..." />
            <CommandList>
              <CommandEmpty>No users found.</CommandEmpty>
              <CommandGroup>
                {projectMembers.map((member) => (
                  <CommandItem
                    key={member.id}
                    value={`${member.userId}-${member.firstName} ${member.lastName}`}
                    onSelect={() => handleAssignUser(member)}
                    className="flex w-full items-center space-x-2"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatarUrl || ''} />
                      <AvatarFallback>
                        {getInitials(
                          member.userId ? `${member.firstName} ${member.lastName}` : member.email,
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <span>
                      {member.userId ? `${member.firstName} ${member.lastName}` : member.email}
                    </span>
                    <Check
                      className={cn(
                        'ml-auto h-4 w-4 transition-opacity',
                        story.assignedTo === member.userId ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default AssigneePopover;
