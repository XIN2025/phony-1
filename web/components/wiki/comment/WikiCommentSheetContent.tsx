import React from 'react';
import { SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useSession } from 'next-auth/react';
import { WikiCommentList } from '@/components/wiki/comment/WikiCommentList';
import { ProjectMember } from '@/types/project';
import { Wiki } from '@/types/wiki';

interface WikiCommentSheetContentProps {
  wiki: Wiki;
  projectMembers?: ProjectMember[];
}

const WikiCommentSheetContent = ({ wiki, projectMembers }: WikiCommentSheetContentProps) => {
  const { data: session } = useSession();
  return (
    <SheetContent className="w-full overflow-y-auto max-sm:px-1 sm:min-w-[550px] md:min-w-[700px]">
      <div className="grid gap-4">
        <div>
          <SheetTitle className="text-lg font-semibold">Comments</SheetTitle>
          <p className="text-muted-foreground mb-4 text-sm">Markdown is supported</p>
          <WikiCommentList
            projectMembers={projectMembers ?? []}
            wikiId={wiki.id}
            currentUserId={session?.id || ''}
          />
        </div>
      </div>
    </SheetContent>
  );
};

export default WikiCommentSheetContent;
