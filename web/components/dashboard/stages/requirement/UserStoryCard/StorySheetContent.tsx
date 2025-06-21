import { SheetContent, SheetTitle } from '@/components/ui/sheet';
import { SheetHeader } from '@/components/ui/sheet';
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Check, Copy } from 'lucide-react';
import { CommentList } from '@/components/comments/CommentList';
import { Button } from '@/components/ui/button';
import { UserStoriesDto } from '@/types/user-stories';
import StoryDescription from './StoryDescription';
import AcceptanceCriteriaSection from './AcceptanceCriteriaSection';
import { ProjectMember } from '@/types/project';
import { format } from 'date-fns';

interface StorySheetContentProps {
  story: UserStoriesDto;
  open: boolean;
  onChangeStory: (story: UserStoriesDto) => void;
  projectMembers?: ProjectMember[];
}

const StorySheetContent = ({ story, onChangeStory, projectMembers }: StorySheetContentProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const { data: session } = useSession();

  const handleCopyPrompt = () => {
    const prompt = `
**Create production-ready code implementing exactly these requirements using current best practices**

## Implementation Blueprint
### Core Requirements
**User Story**:  
${story.title}

**Narrative Context**:  
${story.description}

### Critical Functionality
${
  story.acceptanceCriteria.length > 0
    ? `**Acceptance Criteria**:  
${story.acceptanceCriteria.map((criteria, index) => `${index + 1}. ${criteria.criteria}`).join('\n')}
`
    : ''
}${
      story.dbSchemaPrompt
        ? `**Database Schema Requirements**:  
${story.dbSchemaPrompt}
`
        : ''
    }${
      story.apiPrompt
        ? `**API Contract**:  
${story.apiPrompt}
`
        : ''
    }${
      story.uiPrompt
        ? `**UI Requirements**:  
${story.uiPrompt}
`
        : ''
    }
## Implementation Instructions
1. **Database First**: Start with complete database schema implementation
2. **API Development**: Create fully functional endpoints with validation
3. **UI Integration**: Build UI components that consume the API
4. **Testing Infrastructure**: Include unit/integration test stubs

## Additional Notes
- Ensure all requirements are met and the code is production-ready
- Use the latest best practices and patterns for the technology stack
- Follow the project's coding standards and conventions
- Handle errors and edge cases gracefully
- Test thoroughly and write comprehensive unit tests (if applicable)
`;

    navigator.clipboard
      .writeText(prompt)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <SheetContent className="w-full overflow-y-auto sm:min-w-[550px] md:min-w-[700px]">
      <SheetHeader className="space-y-4 pb-4">
        <div className="flex items-center gap-3">
          <SheetTitle>{story.title}</SheetTitle>
          <Button variant="ghost" size="icon" onClick={handleCopyPrompt}>
            {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </SheetHeader>

      <div className="grid gap-4 px-3">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">
            <span className="text-foreground">Created</span>:{' '}
            {format(new Date(story.createdAt), 'MMM d, yyyy h:mm a')}
          </span>
          <span className="text-muted-foreground text-sm">
            <span className="text-foreground">Updated</span>:{' '}
            {format(new Date(story.updatedAt), 'MMM d, yyyy h:mm a')}
          </span>
        </div>
        <StoryDescription story={story} onChangeStory={onChangeStory} />
        <AcceptanceCriteriaSection
          story={story}
          onChangeStory={onChangeStory}
          loadingCriterion={false}
        />
        <div>
          <h3 className="text-lg font-semibold">Comments</h3>
          <p className="text-muted-foreground mb-4 text-sm">Markdown is supported</p>
          <CommentList
            projectMembers={projectMembers ?? []}
            storyId={story.id}
            currentUserId={session?.id || ''}
          />
        </div>
      </div>
    </SheetContent>
  );
};

export default StorySheetContent;
