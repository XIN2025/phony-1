'use client';

import { WikiEditor, WikiEditorSkeleton } from '@/components/wiki/WikiEditor';
import { WikiService } from '@/services/wiki.api';
import { ProjectMember } from '@/types/project';
import { Wiki, WikiAccessLevel } from '@/types/wiki';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

type WikiPageProps = {
  id: string;
  /**
   * The access level of the user to the wiki
   * View: The user can view the wiki
   * Comment: The user can comment on the wiki and view the wiki, no editing
   * Edit: The user can edit the wiki, comment on the wiki and view the wiki
   */
  projectMembers: ProjectMember[];
  access: WikiAccessLevel;
};

const WikiPage = ({ id, access, projectMembers }: WikiPageProps) => {
  const [wiki, setWiki] = useState<Wiki | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWiki = useCallback(async () => {
    try {
      const result = await WikiService.findById(id);
      if (result.data) {
        setWiki(result.data);
      } else {
        throw new Error('Wiki not found');
      }
    } catch (error) {
      console.error('Error fetching wiki:', error);
      toast.error('Failed to fetch wiki');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchWiki();
  }, [fetchWiki]);

  const handleWikiChange = useCallback((updatedWiki: Wiki) => {
    setWiki(updatedWiki);
  }, []);

  if (isLoading) {
    return <WikiEditorSkeleton />;
  }

  if (!wiki) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Wiki not found</p>
      </div>
    );
  }

  return (
    <WikiEditor
      wiki={wiki}
      projectMembers={projectMembers}
      onChange={handleWikiChange}
      access={access}
    />
  );
};

export default WikiPage;
