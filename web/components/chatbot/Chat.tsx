'use client';
import React, { useState, useEffect } from 'react';
import { Bot, Plus, Send } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '@/components/ui/input';
import { useChat } from '@ai-sdk/react';
import Messages from './Messages';
import { useSession } from 'next-auth/react';
import { ChatbotService } from '@/services/chatbot.api';

const Chat = ({ projectName }: { projectName: string }) => {
  const { data: session } = useSession();
  const [conversationId, setConversationId] = useState<string | undefined>();

  useEffect(() => {
    const savedConversationId = localStorage.getItem('chatConversationId');
    if (savedConversationId) {
      setConversationId(savedConversationId);
    }
  }, []);

  const { messages, status, append, error, input, reload, setMessages, setInput, handleSubmit } =
    useChat({
      api: `${process.env.NEXT_PUBLIC_API_URL}/chatbot/send-message`,
      sendExtraMessageFields: true,
      experimental_throttle: 100,
      headers: {
        Authorization: `Bearer ${session?.token}`,
      },
      experimental_prepareRequestBody: (body) => {
        const lastMessage = body.messages[body.messages.length - 1];
        return {
          content: lastMessage.content,
          projectName,
          conversationId,
          role: lastMessage.role,
        };
      },
    });

  const handleSuggestionClick = (suggestion: string) => {
    append({
      role: 'user',
      content: suggestion,
    });
  };

  const handleSend = async () => {
    if (!conversationId) {
      try {
        const response = await ChatbotService.createConversation(projectName);
        const newConversationId = response?.conversationId;
        if (newConversationId) {
          localStorage.setItem('chatConversationId', newConversationId);
          setConversationId(newConversationId);
        }
      } catch (error) {
        console.error('Failed to create conversation:', error);
      }
    }
    handleSubmit();
  };

  return (
    <div className="sticky top-0 mx-auto flex h-[calc(100dvh-100px)] w-full max-w-5xl flex-1 flex-col p-2">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Bot className="text-primary h-5 w-5" />
            <h1 className="text-lg font-semibold">Chatbot</h1>
          </div>
          <p className="text-muted-foreground text-sm">Ask any question related to this project</p>
        </div>
        <Button
          size="sm"
          disabled={status === 'streaming'}
          onClick={async () => {
            try {
              const response = await ChatbotService.createConversation(projectName);
              const newConversationId = response?.conversationId;
              if (newConversationId) {
                localStorage.setItem('chatConversationId', newConversationId);
                setConversationId(newConversationId);
                setMessages([]);
              }
            } catch (error) {
              console.error('Failed to create new conversation:', error);
              localStorage.removeItem('chatConversationId');
              setConversationId(undefined);
              setMessages([]);
            }
          }}
          className="max-sm:hidden"
        >
          <Plus className="mr-2 h-4 w-4" /> New Chat
        </Button>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Messages
          messages={messages}
          status={status}
          error={error}
          reload={reload}
          handleSuggestionClick={handleSuggestionClick}
        />

        <div className="flex items-center gap-2 p-3">
          <Input
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500"
          />
          <Button
            onClick={handleSend}
            disabled={input.length === 0 || status === 'streaming'}
            className="px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
