import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Message } from '@ai-sdk/react';
import { useSession } from 'next-auth/react';
import React from 'react';
import CustomMarkdown from './CustomMarkdown';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { getInitials } from '@/lib/utils';
interface UserMessageProps {
  message: Message;
}

const UserMessage = ({ message }: UserMessageProps) => {
  const { data: session } = useSession();

  return (
    <div className="flex w-full justify-end gap-3">
      <div className={cn('flex flex-col gap-1', 'items-start')}>
        <div className={'bg-primary w-full rounded-2xl px-4 py-2'}>
          <CustomMarkdown content={message.content} className="prose-invert dark:prose" />
        </div>
        <span className={cn('text-xs', 'text-muted-foreground')}>
          {format(new Date(message.createdAt || new Date()), 'h:mm a')}
        </span>
      </div>
      <Avatar className="h-8 w-8 rounded-md">
        <AvatarImage className="rounded-md" src={session?.user?.image as string} />
        <AvatarFallback className="rounded-md text-sm">
          {getInitials(session?.user?.name as string)}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};

export default UserMessage;
