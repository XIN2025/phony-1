import UserMessage from './UserMessage';
import AIMessage from './AIMessage';
import { Message, UseChatHelpers } from '@ai-sdk/react';

interface ChatMessageProps {
  message: Message;
  reload: UseChatHelpers['reload'];
  status: UseChatHelpers['status'];
}

export function ChatMessage({ message, reload, status }: ChatMessageProps) {
  if (message.role === 'user') {
    return <UserMessage message={message} />;
  } else {
    return <AIMessage message={message} reload={reload} status={status} />;
  }
}
