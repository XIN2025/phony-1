import React from 'react';
import { Button } from '../ui/button';
import { MessageSquare } from 'lucide-react';
const suggestedQuestions = [
  'What are the tasks for current running sprint?',
  'Can you summarize the last meeting?',
  'Where can I find the project documentation?',
];

type GreetingProps = {
  handleSuggestionClick: (suggestion: string) => void;
};

const Greeting = ({ handleSuggestionClick }: GreetingProps) => {
  return (
    <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
      <div className="bg-primary/10 rounded-full p-4">
        <MessageSquare className="text-primary h-10 w-10" />
      </div>
      <div className="space-y-2">
        <h3 className="text-primary dark:text-primary font-medium">How can I help you today?</h3>
        <p className="text-muted-foreground text-sm dark:text-zinc-400">
          Ask me anything about this project - tasks, deadlines, or resources.
        </p>
      </div>
      <div className="mt-6 grid w-full max-w-sm gap-2">
        {suggestedQuestions.map((suggestion) => (
          <Button
            key={suggestion}
            variant="outline"
            className="hover:bg-primary/5 justify-start bg-white text-left dark:bg-zinc-800 dark:hover:bg-zinc-700"
            onClick={() => handleSuggestionClick(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Greeting;
