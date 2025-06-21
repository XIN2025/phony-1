import React, { useEffect, useState } from 'react';
import { Calendar, FileTextIcon, Loader2, Trash2, PencilIcon, Check, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import AudioSourceView from '../source/AudioSourceView';
import FileSourceView from '../source/FileSourceView';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Bug } from '@/types/bug';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { BugsService } from '@/services/bugs.api';
import { isAxiosError } from 'axios';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { BugsCommentList } from './comment/BugsCommentList';
import { ProjectMember } from '@/types/project';
import { useSession } from 'next-auth/react';
import { Input } from '@/components/ui/input';

interface BugDrawerProps {
  bug?: Bug | null;
  isOpen: boolean;
  onOpenChange: (bool: boolean) => void;
  projectMembers: ProjectMember[];
  isLoading?: boolean;
  onDelete: () => void;
  onChange: (bug: Bug) => void;
}

const BugDrawer: React.FC<BugDrawerProps> = ({
  bug,
  isOpen,
  onOpenChange,
  isLoading = false,
  onDelete,
  projectMembers,
  onChange,
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState(false);
  const [title, setTitle] = useState(bug?.title || '');
  const [textFeedback, setTextFeedback] = useState(bug?.textFeedback || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const { data: session } = useSession();

  const handleDeleteFeedback = async () => {
    if (!bug) return;
    try {
      setIsDeleting(true);
      const res = await BugsService.deleteBug(bug.id);
      if (res.data) {
        toast.success('Bug deleted successfully');
      } else {
        toast.error(res.error?.message);
      }
      onDelete();
      onOpenChange(false);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error(error);
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message);
      } else {
        toast.error('Failed to delete bug');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (bug) {
      setTitle(bug.title || '');
      setTextFeedback(bug.textFeedback || '');
    }
  }, [bug]);

  const handleUpdateBug = async (field: 'title' | 'textFeedback') => {
    if (!bug) return;
    try {
      setIsUpdating(true);
      const updateData = field === 'title' ? { title } : { textFeedback };
      const res = await BugsService.updateBug(bug.id, updateData);
      if (res.data) {
        toast.success(`Bug ${field} updated successfully`);
        onChange(res.data);
        if (field === 'title') setEditingTitle(false);
        else setEditingFeedback(false);
      } else {
        toast.error(res.error?.message);
      }
    } catch (error) {
      console.error(error);
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message);
      } else {
        toast.error(`Failed to update bug ${field}`);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:min-w-[550px] md:min-w-[700px]">
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle>
                <div className="mb-2 flex items-center justify-between gap-2 pr-4">
                  <div className="flex w-full items-center gap-2">
                    <FileTextIcon className="h-5 w-5" />
                    {editingTitle ? (
                      <div className="flex flex-1 items-center gap-2">
                        <Input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="flex-1"
                          disabled={isUpdating}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleUpdateBug('title')}
                          disabled={isUpdating}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditingTitle(false);
                            setTitle(bug?.title || '');
                          }}
                          disabled={isUpdating}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-1 items-center gap-2">
                        <h2 className="text-lg sm:text-xl">{bug?.title ?? 'Bug'}</h2>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditingTitle(true)}
                          className="h-6 w-6"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <Trash2
                    className="text-muted-foreground h-5 w-5 cursor-pointer hover:text-red-500 max-sm:h-4 max-sm:w-4"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  />
                </div>
                {bug && (
                  <div className="text-muted-foreground flex items-center gap-2 text-xs sm:text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(bug.createdAt), 'MMM d, yyyy hh:mm a')}</span>
                  </div>
                )}
              </SheetTitle>
            </SheetHeader>
            {bug && (
              <div className="no-scrollbar flex-1 space-y-8 overflow-y-auto px-3 py-3">
                {bug.textFeedback && (
                  <Card className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-medium">Feedback</h3>
                      {!editingFeedback && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditingFeedback(true)}
                          className="h-6 w-6"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {editingFeedback ? (
                      <div className="space-y-2">
                        <Textarea
                          value={textFeedback}
                          onChange={(e) => setTextFeedback(e.target.value)}
                          className="resize-none"
                          rows={5}
                          disabled={isUpdating}
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingFeedback(false);
                              setTextFeedback(bug?.textFeedback || '');
                            }}
                            disabled={isUpdating}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateBug('textFeedback')}
                            disabled={isUpdating}
                          >
                            {isUpdating ? 'Saving...' : 'Save'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <ReactMarkdown>{bug.textFeedback}</ReactMarkdown>
                    )}
                  </Card>
                )}
                {bug.summary && (
                  <Card className="p-4">
                    <h3 className="mb-2 font-medium">Summary</h3>
                    <ReactMarkdown>{bug.summary}</ReactMarkdown>
                  </Card>
                )}

                {bug.voiceFeedbackUrl && <AudioSourceView url={bug.voiceFeedbackUrl} />}
                {bug.screenshots && bug.screenshots.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-medium">Files</h3>
                      <Badge variant="secondary" className="text-xs">
                        {bug.screenshots.length} {bug.screenshots.length === 1 ? 'file' : 'files'}
                      </Badge>
                    </div>
                    <ScrollArea>
                      <div className="flex flex-wrap gap-3 sm:gap-5">
                        {bug.screenshots.map((url, index) => {
                          return (
                            <FileSourceView
                              filename={`image-${index}`}
                              isImage={true}
                              key={index}
                              url={url}
                            />
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                )}
                <div className="grid gap-4">
                  <div>
                    <SheetTitle className="text-lg font-semibold">Comments</SheetTitle>
                    <p className="text-muted-foreground mb-4 text-sm">Markdown is supported</p>
                    <BugsCommentList
                      projectMembers={projectMembers ?? []}
                      bugId={bug.id}
                      currentUserId={session?.id || ''}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </SheetContent>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bug</AlertDialogTitle>
            <AlertDialogDescription>Are you sure. This will delete the bug.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteFeedback} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
};

export default BugDrawer;
