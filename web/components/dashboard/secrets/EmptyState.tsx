import { Loader2, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  isLoading?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  isLoading = false,
}: EmptyStateProps) {
  return (
    <div className="flex h-[400px] flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-8 text-center">
      <Icon className="text-muted-foreground h-12 w-12" />
      <div className="space-y-2">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : actionLabel}
        </Button>
      )}
    </div>
  );
}
