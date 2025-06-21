import { useEffect, useRef } from 'react';
import { ChatMessage } from './Message';
import { Message, UseChatHelpers } from '@ai-sdk/react';
import MessageLoading from './MessageLoading';
import ErrorMessage from './ErrorMessage';
import Greeting from './Greeting';

interface GlobalChatMessagesProps {
  messages: Message[];
  status: UseChatHelpers['status'];
  error?: Error;
  reload: UseChatHelpers['reload'];
  handleSuggestionClick: (suggestion: string) => void;
}

const Messages = ({
  messages,
  status,
  error,
  reload,
  handleSuggestionClick,
}: GlobalChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <Greeting handleSuggestionClick={handleSuggestionClick} />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
      <div className="mx-auto flex max-w-5xl min-w-0 flex-col gap-4">
        {messages.map((message, index) => (
          <ChatMessage
            key={message.id || index}
            message={message}
            reload={reload}
            status={status}
          />
        ))}
        {status === 'submitted' &&
          messages.length > 0 &&
          messages[messages.length - 1].role === 'user' && <MessageLoading />}
        {status === 'error' && <ErrorMessage error={error?.message ?? 'An error occurred'} />}
      </div>
      <div ref={messagesEndRef} className="min-h-[24px] min-w-[24px] shrink-0" />
    </div>
  );
};

export default Messages;
