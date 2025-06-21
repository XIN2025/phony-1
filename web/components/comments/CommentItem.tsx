'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Comment, CommentService } from '@/services/comments.api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { MentionsInput } from './MentionsInput';
import { MentionsRenderer } from './MentionsRenderer';
import { ProjectMember } from '@/types/project';
import { cn } from '@/lib/utils';

interface CommentItemProps {
  comment: Comment;
  onUpdate?: () => void;
  onError?: (message: string) => void;
  currentUserId: string;
  projectMembers: ProjectMember[];
  className?: string;
}

export function CommentItem({
  comment,
  onUpdate,
  onError,
  currentUserId,
  projectMembers,
  className,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isOwner = currentUserId === comment.userId;
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });

  const handleUpdate = async () => {
    if (!editContent.trim() || editContent.trim() === comment.content) {
      setIsEditing(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await CommentService.updateComment(comment.id, {
        content: editContent.trim(),
      });
      if (res.data) {
        onUpdate?.();
      } else {
        onError?.(res.error?.message);
      }
      setIsEditing(false);
    } catch {
      onError?.('Failed to update comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (confirmDelete) {
      setIsSubmitting(true);
      try {
        const res = await CommentService.deleteComment(comment.id);
        if (res.data) {
          onUpdate?.();
        } else {
          onError?.(res.error?.message || 'Failed to delete comment. Please try again.');
        }
      } catch {
        onError?.('Failed to delete comment. Please try again.');
        setConfirmDelete(false);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setConfirmDelete(true);
    }
  };

  const cancelDelete = () => {
    setConfirmDelete(false);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const cancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  return (
    <div className={cn('flex gap-3 border-b pt-3 pb-3', isOwner && 'bg-muted/5', className)}>
      <Avatar className="h-8 w-8">
        <AvatarImage
          src={comment.user.avatarUrl}
          alt={`${comment.user.firstName} ${comment.user.lastName}`}
        />
        <AvatarFallback className="text-xs">
          {getInitials(comment.user.firstName, comment.user.lastName)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="truncate font-medium">
            {comment.user.firstName} {comment.user.lastName}
          </span>
          <span className="text-muted-foreground text-xs">{timeAgo}</span>
          {comment.isEdited && <span className="text-muted-foreground text-xs">(edited)</span>}
        </div>

        {isEditing ? (
          <div className="mt-2 space-y-2">
            <MentionsInput
              value={editContent}
              onChange={setEditContent}
              placeholder="Edit your comment..."
              projectMembers={projectMembers}
              className="min-h-[80px]"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={cancelEdit} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleUpdate}
                disabled={
                  !editContent.trim() || editContent.trim() === comment.content || isSubmitting
                }
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-1 text-sm">
              <MentionsRenderer content={comment.content} projectMembers={projectMembers} />
            </div>

            {isOwner && (
              <div className="mt-1 flex gap-2">
                {confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs">Confirm?</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      disabled={isSubmitting}
                      className="h-6 px-2 text-xs"
                    >
                      {isSubmitting ? 'Deleting...' : 'Delete'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelDelete}
                      className="h-6 px-2 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      disabled={isSubmitting}
                      className="h-6 px-2 text-xs"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDelete}
                      disabled={isSubmitting}
                      className="h-6 px-2 text-xs text-red-500"
                    >
                      Delete
                    </Button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
