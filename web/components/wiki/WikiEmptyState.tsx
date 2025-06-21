'use client';

import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';

interface WikiEmptyStateProps {
  onCreateWiki: () => void;
}

export function WikiEmptyState({ onCreateWiki }: WikiEmptyStateProps) {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        <div className="rounded-xl border-2 border-dashed p-4">
          <FileText className="text-muted-foreground h-8 w-8" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No wiki selected</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          Select a wiki from the sidebar or create a new one to get started.
        </p>
        <Button onClick={onCreateWiki} className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Wiki
        </Button>
      </div>
    </div>
  );
}
