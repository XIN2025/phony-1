import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Search } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { TaskDto } from '@/types/user-stories';

type Props = {
  task: TaskDto;
};

const ResearchSheet = ({ task }: Props) => {
  if (!task.research) return null;
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          onClick={(e) => e.stopPropagation()}
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <Search size={14} />
        </Button>
      </SheetTrigger>
      <SheetContent
        onClick={(e) => e.stopPropagation()}
        side="right"
        className="flex min-w-[90vw] flex-col sm:min-w-[540px]"
      >
        <SheetHeader>
          <SheetTitle>Research Results</SheetTitle>
          <SheetDescription>
            Search results and extracted content for this research task
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 flex-1 space-y-6 overflow-y-auto px-3">
          {task.research.searchResults && task.research.searchResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Search Results</h3>
              <div className="space-y-4">
                {task.research.searchResults.map((result, index) => (
                  <div key={index} className="space-y-2 rounded-lg border p-4">
                    <h4 className="font-medium">{result.title}</h4>
                    <p className="text-muted-foreground text-sm">{result.snippet}</p>
                    <a
                      href={result.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline"
                    >
                      {result.link}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {task.research.extractedContent && task.research.extractedContent.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Extracted Content</h3>
              <div className="space-y-4">
                {task.research.extractedContent.map((content, index) => (
                  <Button key={index} variant="outline" className="w-full justify-between">
                    <span className="truncate">{content.url}</span>
                    <FileText className="ml-2 h-4 w-4" />
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ResearchSheet;
