'use client';

import { useState, useEffect, useCallback } from 'react';
import { WikiCommentItem } from './WikiCommentItem';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProjectMember } from '@/types/project';
import { WikiCommentInput } from './WikiCommentInput';
import { WikiComment, WikiService } from '@/services/wiki.api';
import { Skeleton } from '@/components/ui/skeleton';

interface WikiCommentListProps {
  wikiId: string;
  currentUserId: string;
  projectMembers: ProjectMember[];
}

export function WikiCommentList({ wikiId, currentUserId, projectMembers }: WikiCommentListProps) {
  const [comments, setComments] = useState<WikiComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(
    async (showLoading = true) => {
      if (showLoading) {
        setIsLoading(true);
      }
      try {
        const response = await WikiService.getComments(wikiId);
        if (response.data) {
          setComments(response.data);
        } else {
          setError(response.error.message);
        }
        setError(null);
      } catch {
        setError('Failed to load comments. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [wikiId],
  );

  useEffect(() => {
    fetchComments(true);
  }, [fetchComments, wikiId]);

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
      <WikiCommentInput
        wikiId={wikiId}
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
        {comments?.length === 0 ? (
          <p className="text-center text-gray-500">No comments yet. Be the first to comment!</p>
        ) : (
          comments?.map((comment) => (
            <WikiCommentItem
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
