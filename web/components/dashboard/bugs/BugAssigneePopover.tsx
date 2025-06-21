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
import { Bug } from '@/types/bug';
import { ProjectMember } from '@/types/project';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type Props = {
  bug: Bug;
  projectMembers: ProjectMember[];
  onAssigneeChange: (bugId: string, assigneeId?: string) => Promise<void>;
};

const BugAssigneePopover = ({ bug, projectMembers, onAssigneeChange }: Props) => {
  const [assigneeLoading, setAssigneeLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleAssignUser = async (member: ProjectMember) => {
    try {
      setShowModal(false);
      setAssigneeLoading(true);
      let assigneeId = member.userId;
      if (bug.assignee?.id === member.userId) {
        assigneeId = undefined;
      }

      await onAssigneeChange(bug.id, assigneeId);
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
                ) : bug.assignee ? (
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={bug.assignee?.avatar_url} />
                    <AvatarFallback>
                      {`${bug.assignee?.first_name[0]}${bug.assignee?.last_name[0]}`.toUpperCase()}
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
            {bug.assignee
              ? `Assigned to ${bug.assignee.first_name} ${bug.assignee.last_name}`
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
                          member.userId
                            ? `${member?.firstName} ${member?.lastName ?? ''}`
                            : member.email.split('@')[0],
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <span>
                      {member.userId
                        ? member?.firstName + ' ' + member?.lastName
                        : member.email.split('@')[0]}
                    </span>
                    <Check
                      className={cn(
                        'ml-auto h-4 w-4 transition-opacity',
                        bug.assignee?.id === member.userId ? 'opacity-100' : 'opacity-0',
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

export default BugAssigneePopover;
