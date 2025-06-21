import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { toast } from 'sonner';
import { UserStoryService } from '@/services';
import { UserStoriesDto } from '@/types/user-stories';
import { LinkifyText } from '@/components/LinkifyText';

type Props = {
  story: UserStoriesDto;
  onChangeStory: (story: UserStoriesDto) => void;
};

const StoryDescription = ({ story, onChangeStory }: Props) => {
  const [editingDescription, setEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(story.description);

  const handleDescriptionUpdate = async () => {
    try {
      const response = await UserStoryService.updateUserStories(story.id, {
        ...story,
        description: editedDescription,
      });
      if (response.data) {
        onChangeStory(response.data);
        setEditingDescription(false);
      } else {
        toast.error(response.error.message);
      }
    } catch {
      toast.error('Failed to update description');
    }
  };

  return (
    <div className="border-border bg-sidebar rounded-lg border p-3">
      {editingDescription ? (
        <div className="flex flex-col space-y-2">
          <Textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                handleDescriptionUpdate();
              } else if (e.key === 'Escape') {
                setEditingDescription(false);
                setEditedDescription(story.description);
              }
            }}
            autoFocus
          />
          <div className="flex justify-end space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditingDescription(false);
                setEditedDescription(story.description);
              }}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleDescriptionUpdate}>
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="text-foreground text-base italic max-md:text-sm"
          onDoubleClick={() => {
            setEditingDescription(true);
            setEditedDescription(story.description);
          }}
        >
          <LinkifyText text={story.description} />
        </div>
      )}
    </div>
  );
};

export default StoryDescription;
