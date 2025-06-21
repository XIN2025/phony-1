'use client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FileText, Loader2, EllipsisVertical, GitBranchPlus, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogCancel,
} from '../ui/alert-dialog';
import { Wiki } from '@/types/wiki';
import { useState } from 'react';
import { Session } from 'next-auth';

interface WikiSidebarItemProps {
  wiki: Wiki;
  wikiId: string;
  session: Session | null;
  isDeleting: string | null;
  isChild: boolean;
  handleCereateSubWiki: ((parentId: string) => Promise<void>) | null;
  handleDeleteWiki: (wikiId: string, parentId: string | null) => Promise<void>;
}

export const WikiSidebarItem = ({
  wiki,
  wikiId,
  session,
  isDeleting,
  isChild,
  handleCereateSubWiki,
  handleDeleteWiki,
}: WikiSidebarItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div className="relative">
        <Link
          href={`/dashboard/project/${wiki.project_id}/wiki/${wiki.id}`}
          className={cn(
            'group hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
            'w-full',
            { 'bg-accent': wiki.id === wikiId },
            { [`pl-6`]: isChild }, // Dynamic left margin based on nesting level
          )}
        >
          <FileText size={16} />
          <span className="line-clamp-1">{wiki.title || 'Untitled'}</span>
          {wiki.created_by === session?.id && (
            <div
              className="ml-auto flex items-center"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-4 w-4">
                      {isDeleting === wiki.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <EllipsisVertical className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!wiki.parent_id && ( // Only show Create Subwiki for parent wikis
                      <DropdownMenuItem onClick={() => handleCereateSubWiki?.(wiki.id)}>
                        <GitBranchPlus className="mr-2 h-4 w-4" />
                        Create Subwiki
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => setIsOpen(true)}>
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this wiki.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteWiki(wiki.id, wiki.parent_id ?? null)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </Link>
      </div>
    </>
  );
};
