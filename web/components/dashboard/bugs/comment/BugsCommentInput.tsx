'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProjectMember } from '@/types/project';
import { MentionsInput } from '@/components/comments/MentionsInput';
import { BugsService } from '@/services/bugs.api';

interface BugsCommentInputProps {
  bugId: string;
  parentId?: string;
  onSuccess?: () => void;
  placeholder?: string;
  onError?: (message: string) => void;
  projectMembers: ProjectMember[];
}

export function BugsCommentInput({
  bugId,
  parentId,
  onSuccess,
  onError,
  placeholder = 'Add a comment...',
  projectMembers,
}: BugsCommentInputProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await BugsService.addComment({
        bugId: bugId,
        content: content.trim(),
        parentId,
      });

      if (!response.data) {
        throw new Error('Failed to add comment');
      }

      setContent('');
      onSuccess?.();
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
