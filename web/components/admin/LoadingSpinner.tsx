import { Loader2 } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <Loader2 className="text-primary h-8 w-8 animate-spin" />
    </div>
  );
}
