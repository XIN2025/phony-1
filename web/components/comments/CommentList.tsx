'use client';

import { useState, useEffect, useCallback } from 'react';
import { Comment, CommentService } from '@/services/comments.api';
import { CommentItem } from './CommentItem';
import { CommentInput } from './CommentInput';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProjectMember } from '@/types/project';
import { Skeleton } from '../ui/skeleton';

interface CommentListProps {
  storyId: string;
  currentUserId: string;
  projectMembers: ProjectMember[];
}

export function CommentList({ storyId, currentUserId, projectMembers }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(
    async (showLoading = true) => {
      if (showLoading) {
        setIsLoading(true);
      }
      try {
        const response = await CommentService.getComments(storyId);
        if (response.data) {
          setComments(response.data);
          setError(null);
        } else {
          setError(response.error.message);
        }
      } catch {
        setError('Failed to load comments. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [storyId],
  );

  useEffect(() => {
    fetchComments(true);
  }, [fetchComments, storyId]);

  const handleCommentSuccess = () => {
    fetchComments(false);
  };

  const handleError = (message: string) => {
    setError(message);
    // Clear error after 2 seconds
    setTimeout(() => setError(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4 rounded-lg border p-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CommentInput
        storyId={storyId}
        onSuccess={handleCommentSuccess}
        onError={handleError}
        placeholder="Write a comment (Write @ to mention a team member)..."
        projectMembers={projectMembers}
      />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-muted-foreground text-center">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onUpdate={() => fetchComments(false)}
              onError={handleError}
              projectMembers={projectMembers}
            />
          ))
        )}
      </div>
    </div>
  );
}
