import { cn } from '@/lib/utils';
import { Message, UseChatHelpers } from '@ai-sdk/react';
import React from 'react';
import { format } from 'date-fns';
import { toolComponents } from './tools';
import { RefreshCcw } from 'lucide-react';
import CustomMarkdown from './CustomMarkdown';
import { Button } from '../ui/button';
import Image from 'next/image';

type PagsMessageProps = {
  message: Message;
  reload: UseChatHelpers['reload'];
  status: UseChatHelpers['status'];
};

const RegenerateButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    onClick={onClick}
    size="sm"
    variant="ghost"
    aria-label="Regenerate message"
    className="text-muted-foreground h-7 gap-1 text-xs"
  >
    <RefreshCcw className="size-3.5" />
    <span className="text-xs">Regenerate</span>
  </Button>
);

const PagsMessage = ({ message, reload, status }: PagsMessageProps) => {
  const handleRegenerate = () => {
    reload();
  };
  return (
    <div className="flex max-w-full justify-start gap-3">
      <Image
        src={'https://d2iyl9s54la9ej.cloudfront.net/heizen.png'}
        alt="Curie"
        width={100}
        height={100}
        className="size-7 rounded-md"
      />
      <div className={cn('flex flex-1 flex-col gap-1', 'items-start')}>
        <div className={'w-full'}>
          {message.parts?.map((part, index) => {
            const { type } = part;
            if (type === 'reasoning') {
              return <CustomMarkdown key={index} content={part.reasoning} />;
            }
            if (type === 'text') {
              return <CustomMarkdown key={index} content={part.text} />;
            }
            if (type === 'tool-invocation') {
              const { toolName } = part.toolInvocation;
              const ToolComponent = toolComponents[toolName as keyof typeof toolComponents];
              return <ToolComponent key={index} tool={part.toolInvocation} />;
            }
          })}
        </div>
        {status === 'ready' && (
          <div className="flex w-full items-center gap-2">
            <span className={cn('text-xs', 'text-muted-foreground')}>
              {format(new Date(message.createdAt || new Date()), 'h:mm a')}
            </span>
            <RegenerateButton onClick={handleRegenerate} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PagsMessage;
