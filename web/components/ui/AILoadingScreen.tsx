import { cn } from '@/lib/utils';
import { Bot } from 'lucide-react';

interface AILoadingScreenProps {
  text?: string;
  className?: string;
  variant?: 'default' | 'minimal';
}

export const AILoadingScreen = ({
  text = 'AI is thinking...',
  className,
  variant = 'default',
}: AILoadingScreenProps) => {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      {variant === 'default' && (
        <div className="relative h-28 w-28">
          {/* Neural network nodes */}
          <div className="absolute top-1/4 left-1/4">
            <div className="bg-primary/80 h-3 w-3 animate-ping rounded-full" />
          </div>
          <div className="absolute top-1/4 right-1/4">
            <div className="bg-primary/80 h-3 w-3 animate-ping rounded-full delay-300" />
          </div>
          <div className="absolute bottom-1/4 left-1/4">
            <div className="bg-primary/80 h-3 w-3 animate-ping rounded-full delay-500" />
          </div>
          <div className="absolute right-1/4 bottom-1/4">
            <div className="bg-primary/80 h-3 w-3 animate-ping rounded-full delay-700" />
          </div>

          {/* Connecting lines with moving energy */}
          <div className="absolute inset-0">
            <svg className="h-full w-full" viewBox="0 0 100 100">
              <path
                d="M30 30 L70 30 L70 70 L30 70 Z"
                fill="none"
                stroke="currentColor"
                className="text-primary/20"
                strokeWidth="0.5"
              />
              <circle
                r="2"
                className="text-primary animate-[moveAlong_3s_linear_infinite]"
                fill="currentColor"
              >
                <animateMotion
                  dur="3s"
                  repeatCount="indefinite"
                  path="M30 30 L70 30 L70 70 L30 70 Z"
                />
              </circle>
            </svg>
          </div>

          {/* Central brain with pulse effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <Bot className="text-primary h-10 w-10 animate-pulse" />
              <div className="bg-primary/20 absolute inset-0 animate-pulse blur-lg" />
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <p className="text-muted-foreground text-center text-sm font-medium">
          {text}
          <span className="animate-pulse">...</span>
        </p>
        <div className="absolute -bottom-2 left-0 h-0.5 w-full overflow-hidden">
          <div className="animate-loading-bar via-primary h-full w-1/3 bg-linear-to-r from-transparent to-transparent" />
        </div>
      </div>
    </div>
  );
};
