'use client';

import { Wiki, WikiAccessLevel } from '@/types/wiki';
import { Input } from '@/components/ui/input';
import EditorClient from '@/components/EditorClient';
import { useCallback, useEffect, useState } from 'react';
import { WikiService } from '@/services/wiki.api';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useWikiStore } from '@/stores/useWikiStore';
import WikiShare from './WikiShare';
import { useSession } from 'next-auth/react';
import CommentButton from './comment/WikiCommentSheet';
import { ProjectMember } from '@/types/project';
import AddWorklogPopover from '../dashboard/AddWorklogPopover';
import { WorklogService } from '@/services/worklog.api';
import GenerateSprintDialog from './GenerateSprintDialog';
import { Share2 } from 'lucide-react';

interface WikiEditorProps {
  wiki: Wiki;
  onChange?: (wiki: Wiki) => void;
  access: WikiAccessLevel;
  projectMembers?: ProjectMember[];
}

type SaveStatus = 'saved' | 'saving' | 'error';

export function WikiEditor({ wiki, access, projectMembers }: WikiEditorProps) {
  const [title, setTitle] = useState(wiki.title);
  const [content, setContent] = useState(wiki.content || '');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [lastSaved, setLastSaved] = useState(wiki.updated_at);
  const [isSharingDialogOpen, setIsSharingDialogOpen] = useState(false);
  const { data: session } = useSession();
  const { updateWikiTitle } = useWikiStore();

  const onAddLog = async (timeSpent: number, description: string) => {
    try {
      toast.promise(
        WorklogService.createWorklog({
          date: new Date().toISOString(),
          hoursWorked: timeSpent,
          projectId: wiki.project_id,
          wikiId: wiki.id,
          description,
        }),
        {
          loading: 'Adding worklog...',
          success: (res) => {
            if (res.data) {
              return 'Worklog added successfully';
            }
            throw new Error('Failed to add worklog');
          },
          error: () => {
            return 'Error adding worklog';
          },
        },
      );
    } catch {
      console.error('Error adding worklog');
    }
  };

  const updateWikiContent = useCallback(
    async (data: { title?: string; content?: string }) => {
      try {
        setSaveStatus('saving');
        const result = await WikiService.updateById(wiki.id, data);
        if (result.data) {
          setSaveStatus('saved');
          setLastSaved(result.data.updated_at);
          if (data.title) {
            updateWikiTitle(wiki.id, data.title, wiki.parent_id ?? null);
          }
        } else {
          throw new Error('Failed to save');
        }
      } catch {
        setSaveStatus('error');
        toast.error('Error saving wiki', {
          description: 'Your changes could not be saved. Please try again.',
        });
      }
    },
    [wiki.id, wiki.parent_id, updateWikiTitle],
  );

  // Handle title changes
  useEffect(() => {
    if (title !== wiki.title) {
      const timer = setTimeout(() => {
        updateWikiContent({ title });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [title, wiki.title, updateWikiContent]);

  // Handle content changes
  const handleContentChange = useCallback(
    (newContent: string) => {
      if (access !== WikiAccessLevel.Edit) {
        return;
      }
      setContent(newContent);
      updateWikiContent({ content: newContent });
    },
    [access, updateWikiContent],
  );

  const onGenerateSprint = async (type: 'current_sprint' | 'backlog') => {
    toast.promise(WikiService.generateSprint(wiki.id, { type }), {
      loading: 'Generating tasks...',
      success: (res) => {
        if (res.data) {
          return 'Tasks generated successfully!';
        } else {
          throw new Error('Failed to generate tasks');
        }
      },
      error: () => {
        return 'Something went wrong!';
      },
    });
  };

  return (
    <>
      <WikiShare
        isOpen={isSharingDialogOpen}
        onOpenChange={setIsSharingDialogOpen}
        members={[]}
        wikiTitle={wiki.title}
        isPublic={wiki.is_public}
        public_access_level={wiki.public_access_level}
        wikiId={wiki.id}
      />
      <div className="flex h-[calc(100vh-5rem)] flex-col gap-4 p-4">
        <div className="ml-7 flex items-center justify-between">
          <div className="flex-1">
            <Input
              disabled={access !== WikiAccessLevel.Edit}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-none px-0 text-xl font-semibold focus-visible:ring-0"
              placeholder="Untitled"
            />
          </div>
          <div className="flex items-center gap-2">
            <AddWorklogPopover onAddLog={onAddLog} />
            {saveStatus === 'saving' && <Badge variant="outline">Saving...</Badge>}
            {saveStatus === 'saved' && (
              <Badge variant="outline" className="text-muted-foreground">
                Last saved {format(new Date(lastSaved), 'h:mm a')}
              </Badge>
            )}
            {saveStatus === 'error' && <Badge variant="destructive">Save failed</Badge>}
            <GenerateSprintDialog onSuccess={onGenerateSprint} />
            {wiki.created_by === session?.id && (
              <Button variant="outline" onClick={() => setIsSharingDialogOpen(true)} size="icon">
                <Share2 className="size-4" />
              </Button>
            )}
            {access !== WikiAccessLevel.View && (
              <CommentButton wiki={wiki} projectMembers={projectMembers ?? []} />
            )}
            <Avatar className="h-8 w-8">
              <AvatarImage src={wiki.creator?.avatar_url} />
              <AvatarFallback>
                {wiki.creator?.first_name?.[0]}
                {wiki.creator?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        <div className="relative flex-1 overflow-y-auto">
          <EditorClient
            disabled={access !== WikiAccessLevel.Edit}
            content={content}
            onChangeContent={handleContentChange}
          />
        </div>
      </div>
    </>
  );
}

export function WikiEditorSkeleton() {
  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[200px]" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-[100px]" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
      <Skeleton className="flex-1" />
    </div>
  );
}
