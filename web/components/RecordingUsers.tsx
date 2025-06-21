import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useProjectSocket } from '@/contexts/project-socket.context';

interface RecordingUsersProps {
  projectId: string;
}

export const RecordingUsers: React.FC<RecordingUsersProps> = ({ projectId }) => {
  const { recordingUsers, currentProjectId } = useProjectSocket();
  if (currentProjectId !== projectId || recordingUsers.length === 0) return null;

  return (
    <div className="mr-4 flex -space-x-2">
      <TooltipProvider>
        {recordingUsers.map((user) => (
          <Tooltip key={user.userId}>
            <TooltipTrigger asChild>
              <div className="relative inline-block animate-pulse">
                <Avatar className="border-background h-8 w-8 border-2">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback>
                    {user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute right-0 bottom-0 h-2 w-2 rounded-full bg-red-500" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{user.name} is recording</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
};
