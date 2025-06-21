import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import { UserStoriesDto } from '@/types/user-stories';
import { ProjectMember } from '@/types/project';
import { useEffect, useState } from 'react';
import StoryCardHeader from './StoryCardHeader';
import DeleteAlert from './DeleteAlert';
import { UserStoryService } from '@/services';
import { toast } from 'sonner';
import StorySheetContent from './StorySheetContent';
import { useSearchParams } from 'next/navigation';

type Props = {
  story: UserStoriesDto;
  onDelete: () => void;
  projectMembers: ProjectMember[];
  onChangeStory: (story: UserStoriesDto) => void;
  isReordering?: boolean;
};

const UserStoryCard = ({ story, onDelete, projectMembers, onChangeStory, isReordering }: Props) => {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const storyId = searchParams.get('storyId');
    if (storyId === story.id) {
      setOpen(true);
    }
  }, [searchParams, story.id]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const res = await UserStoryService.deleteStory(story.id);
      if (res?.data) {
        setShowDeleteAlert(false);
        onDelete();
        toast.success('User story deleted successfully');
      } else {
        toast.error('Failed to delete user story');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete user story');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (open) {
          // add storyId search params, like replace it
          window.history.replaceState({}, '', `${window.location.pathname}?storyId=${story.id}`);
        } else {
          window.history.replaceState({}, '', `${window.location.pathname}`);
        }
      }}
    >
      <SheetTrigger asChild>
        <StoryCardHeader
          onClick={() => setOpen(true)}
          story={story}
          projectMembers={projectMembers}
          onChangeStory={onChangeStory}
          setShowDeleteAlert={setShowDeleteAlert}
          isReordering={isReordering}
        />
      </SheetTrigger>
      <StorySheetContent
        projectMembers={projectMembers}
        open={open}
        story={story}
        onChangeStory={onChangeStory}
      />
      <DeleteAlert
        open={showDeleteAlert}
        onOpenChange={setShowDeleteAlert}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </Sheet>
  );
};

export default UserStoryCard;
