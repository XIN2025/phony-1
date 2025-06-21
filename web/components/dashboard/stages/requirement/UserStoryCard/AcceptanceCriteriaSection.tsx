import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  CheckCircleIcon,
  ChevronDown,
  Loader2Icon,
  PlusCircle,
  Save,
  Trash,
  X,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { UserStoryService } from '@/services';
import { UserStoriesDto } from '@/types/user-stories';
import { LinkifyText } from '@/components/LinkifyText';
import { cn } from '@/lib/utils';
import { AILoadingScreen } from '@/components/ui/AILoadingScreen';

type Props = {
  story: UserStoriesDto;
  loadingCriterion: boolean;
  onChangeStory: (story: UserStoriesDto) => void;
};

const AcceptanceCriteriaSection = ({ story, onChangeStory, loadingCriterion }: Props) => {
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedCriteria, setEditedCriteria] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCriteria, setNewCriteria] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowButton, setShouldShowButton] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const MAX_HEIGHT = 300; // Maximum height in pixels before showing "Show more" button

  // Check if content exceeds max height
  useEffect(() => {
    const checkHeight = () => {
      if (contentRef.current) {
        const contentHeight = contentRef.current.scrollHeight;
        setShouldShowButton(contentHeight > MAX_HEIGHT);
      }
    };

    checkHeight();

    // Re-check when content changes
    window.addEventListener('resize', checkHeight);
    return () => window.removeEventListener('resize', checkHeight);
  }, [story.acceptanceCriteria, isAddingNew]);

  const handleCriterionToggle = async (index: number) => {
    if (loadingIndex !== null) return;

    try {
      setLoadingIndex(index);
      const updatedCriteria = story.acceptanceCriteria.map((criterion, i) =>
        i === index ? { ...criterion, isCompleted: !criterion.isCompleted } : criterion,
      );

      const response = await UserStoryService.updateUserStories(story.id, {
        ...story,
        acceptanceCriteria: updatedCriteria,
      });

      if (response.data) {
        onChangeStory(response.data);
      } else {
        toast.error(response.error.message);
      }
    } catch {
      toast.error('Failed to update acceptance criteria');
    } finally {
      setLoadingIndex(null);
    }
  };

  const handleUpdateCriteria = async (index: number) => {
    try {
      const updatedCriteria = [...story.acceptanceCriteria];
      updatedCriteria[index] = {
        ...updatedCriteria[index],
        criteria: editedCriteria,
      };
      const response = await UserStoryService.updateUserStories(story.id, {
        ...story,
        acceptanceCriteria: updatedCriteria,
      });
      if (response.data) {
        onChangeStory(response.data);
        setEditingIndex(null);
        setIsAddingNew(true);
        setNewCriteria('');
      } else {
        toast.error(response?.error?.message);
      }
    } catch {
      toast.error('Failed to update criteria');
    }
  };

  const handleAddCriteria = async () => {
    if (!newCriteria.trim()) return;

    try {
      const updatedCriteria = [
        ...story.acceptanceCriteria,
        { criteria: newCriteria.trim(), isCompleted: false },
      ];
      const response = await UserStoryService.updateUserStories(story.id, {
        ...story,
        acceptanceCriteria: updatedCriteria,
      });
      if (response.data) {
        onChangeStory(response.data);
        setNewCriteria('');
      } else {
        toast.error(response?.error?.message);
      }
    } catch {
      toast.error('Failed to add criteria');
    }
  };

  const handleDeleteCriteria = async (index: number) => {
    try {
      const updatedCriteria = story.acceptanceCriteria.filter((_, i) => i !== index);
      const response = await UserStoryService.updateUserStories(story.id, {
        ...story,
        acceptanceCriteria: updatedCriteria,
      });
      if (response.data) {
        onChangeStory(response.data);
      } else {
        toast.error(response?.error?.message);
      }
    } catch {
      toast.error('Failed to delete criteria');
    }
  };

  const NoAcceptanceCriteria = () => {
    if (loadingCriterion) {
      return <AILoadingScreen text="Loading Acceptance Criterion" variant="minimal" />;
    }
    return (
      <div className="text-muted-foreground p-4 text-center text-sm">
        No acceptance criteria found
      </div>
    );
  };

  return (
    <>
      <div className="border-border bg-sidebar relative rounded-lg border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-muted-foreground flex items-center text-sm font-semibold">
            <CheckCircleIcon className="text-primary mr-2 h-4 w-4" />
            Acceptance Criteria
          </h4>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary/80 hover:text-primary h-8"
              onClick={() => {
                setIsAddingNew(true);
                setNewCriteria('');
              }}
            >
              <PlusCircle className="h-4 w-4 md:mr-2" />
              <span className="max-md:hidden">Add Criteria</span>
            </Button>
          </div>
        </div>
        {!isExpanded && shouldShowButton && (
          <div className="from-sidebar pointer-events-none absolute right-0 bottom-6 left-0 h-32 bg-linear-to-t to-transparent" />
        )}
        <div
          ref={contentRef}
          className={cn(
            'space-y-2',
            !isExpanded && shouldShowButton && 'max-h-[300px] overflow-hidden',
          )}
        >
          {story.acceptanceCriteria.map((criterion, index) => (
            <div
              key={index}
              className="group hover:bg-accent/50 flex items-start space-x-3 rounded-lg p-1"
              onDoubleClick={() => {
                setEditingIndex(index);
                setEditedCriteria(criterion.criteria);
              }}
            >
              {loadingIndex === index ? (
                <Loader2Icon className="mt-1 h-4 w-4 animate-spin" />
              ) : (
                <Checkbox
                  checked={criterion.isCompleted}
                  onCheckedChange={() => handleCriterionToggle(index)}
                  disabled={loadingIndex !== null || editingIndex === index}
                  className="mt-1"
                />
              )}
              <div className="flex-1">
                {editingIndex === index ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      value={editedCriteria}
                      onChange={(e) => setEditedCriteria(e.target.value)}
                      className="h-7 flex-1 px-2"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleUpdateCriteria(index);
                        } else if (e.key === 'Escape') {
                          setEditingIndex(null);
                        }
                      }}
                      autoFocus
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditingIndex(null)}
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleUpdateCriteria(index)}
                      className="h-8 w-8 text-green-500 hover:text-green-600"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <LinkifyText
                      text={criterion.criteria}
                      className={cn(
                        'text-sm',
                        criterion.isCompleted && 'text-muted-foreground line-through',
                      )}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteCriteria(index)}
                      className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {story.acceptanceCriteria.length === 0 && <NoAcceptanceCriteria />}
          {isAddingNew && (
            <div className="bg-accent/50 flex items-center space-x-2 rounded-lg p-2">
              <Input
                value={newCriteria}
                onChange={(e) => setNewCriteria(e.target.value)}
                placeholder="Type new criteria and press Enter..."
                className="h-8 flex-1 px-2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && newCriteria.trim()) {
                    e.preventDefault();
                    handleAddCriteria();
                  } else if (e.key === 'Escape') {
                    setIsAddingNew(false);
                  }
                }}
                autoFocus
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsAddingNew(false)}
                className="h-8 w-8 text-red-500 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {shouldShowButton && (
          <div className="flex justify-center bg-none">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-primary/80 hover:text-primary z-40"
            >
              {isExpanded ? 'Show less' : 'Show more'}
              <ChevronDown
                className={cn('ml-1 h-4 w-4 transition-transform', isExpanded && 'rotate-180')}
              />
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default AcceptanceCriteriaSection;
