import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ClockIcon } from 'lucide-react';
import { toast } from 'sonner';
import { UserStoryService } from '@/services';
import { UserStoriesDto } from '@/types/user-stories';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type Props = {
  story: UserStoriesDto;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  onChangeStory: (story: UserStoriesDto) => void;
};

const EstimationPopover = ({ story, showModal, setShowModal, onChangeStory }: Props) => {
  const [editedEstimation, setEditedEstimation] = useState(story.estimation.toString());

  const handleEstimationUpdate = async () => {
    const newEstimation = parseFloat(editedEstimation);
    if (isNaN(newEstimation) || newEstimation < 0) {
      toast.error('Please enter a valid estimation');
      return;
    }

    try {
      const response = await UserStoryService.updateUserStories(story.id, {
        ...story,
        estimation: newEstimation,
      });
      if (response.data) {
        onChangeStory(response.data);
        setShowModal(false);
      } else {
        toast.error(response.error.message);
      }
    } catch {
      toast.error('Failed to update estimation');
    }
  };

  const handlePopoverClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="flex items-center justify-center" onClick={handlePopoverClick}>
      <Popover open={showModal} onOpenChange={setShowModal}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <div className="bg-muted hover:bg-muted/70 flex w-fit min-w-8 cursor-pointer items-center space-x-1 rounded-full px-2 py-0.5 text-xs max-md:hidden">
                <ClockIcon size={14} className="text-muted-foreground" />
                <span>
                  {Number.isInteger(story.estimation)
                    ? story.estimation
                    : story.estimation.toFixed(1)}{' '}
                  hr
                </span>
              </div>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>Update estimation</TooltipContent>
        </Tooltip>
        <PopoverContent className="w-48">
          <div className="flex flex-col space-y-2">
            <Input
              type="number"
              value={editedEstimation}
              onChange={(e) => setEditedEstimation(e.target.value)}
              min="0"
              className="h-8"
            />
            <div className="flex justify-end space-x-2">
              <Button size="sm" variant="ghost" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleEstimationUpdate}>
                Save
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default EstimationPopover;
