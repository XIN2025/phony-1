'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CommentService } from '@/services/comments.api';
import { MentionsInput } from './MentionsInput';
import { ProjectMember } from '@/types/project';

interface CommentInputProps {
  storyId: string;
  parentId?: string;
  onSuccess?: () => void;
  placeholder?: string;
  onError?: (message: string) => void;
  projectMembers: ProjectMember[];
}

export function CommentInput({
  storyId,
  parentId,
  onSuccess,
  onError,
  placeholder = 'Add a comment...',
  projectMembers,
}: CommentInputProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await CommentService.createComment({
        storyId,
        content: content.trim(),
        parentId,
      });
      if (res.data) {
        setContent('');
        onSuccess?.();
      } else {
        onError?.(res.error?.message || 'Failed to add comment. Please try again.');
      }
    } catch {
      onError?.('Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-2">
      <MentionsInput
        value={content}
        onChange={setContent}
        placeholder={placeholder}
        projectMembers={projectMembers}
        className="min-h-[80px]"
      />
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          className="h-8 px-3 text-sm"
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </Button>
      </div>
    </div>
  );
}
