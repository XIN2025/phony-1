import React from 'react';
import { cn } from '@/lib/utils';
import { Step } from '@/types/project';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface ProgressTrackerProps {
  steps: Step[];
  currentIndex: number;
  onClick: (index: number) => void;
}

export default function ProgressTracker({ steps, currentIndex, onClick }: ProgressTrackerProps) {
  const handlePrev = () => {
    if (currentIndex > 0) {
      onClick(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < steps.length - 1) {
      onClick(currentIndex + 1);
    }
  };

  return (
    <div className="flex w-full items-center gap-1">
      <Button variant="ghost" size="icon" onClick={handlePrev} disabled={currentIndex === 0}>
        <ArrowLeft className="h-4 w-4" />
      </Button>
      {steps.map((step, index) => {
        const status =
          index < currentIndex ? 'completed' : index === currentIndex ? 'current' : 'upcoming';
        return (
          <div key={index} className="group relative flex h-10 flex-1 items-center">
            <div
              onClick={() => onClick(index)}
              className={cn(
                'absolute flex h-1.5 w-full cursor-pointer items-center overflow-hidden rounded-full transition-all group-hover:h-6 group-hover:rounded-md',
                {
                  'bg-primary': status === 'completed' || status === 'current',
                  'bg-muted': status === 'upcoming',
                },
              )}
            >
              <div
                className={`${status !== 'upcoming' ? 'text-white' : 'text-foreground'} w-full text-center text-xs opacity-0 transition-opacity group-hover:opacity-100`}
              >
                {step.label}
              </div>
            </div>
          </div>
        );
      })}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleNext}
        disabled={currentIndex === steps.length - 1}
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
