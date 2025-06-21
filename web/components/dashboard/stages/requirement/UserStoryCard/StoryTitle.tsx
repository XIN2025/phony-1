import { Button } from '@/components/ui/button';
import { UserStoryService } from '@/services';
import { UserStoriesDto } from '@/types/user-stories';
import { BookOpen, Check, Edit2, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

type Props = {
  story: UserStoriesDto;
  onChangeStory: (story: UserStoriesDto) => void;
  setShowDeleteAlert: (show: boolean) => void;
  isNew?: boolean;
  rowRef: React.RefObject<HTMLTableRowElement | null>;
};

const StoryTitle: React.FC<Props> = ({
  story,
  onChangeStory,
  isNew = false,
  setShowDeleteAlert,
  rowRef,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(isNew);
  const [editedTitle, setEditedTitle] = useState(story.title);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const setShowDeleteAlertRef = useRef(setShowDeleteAlert);
  setShowDeleteAlertRef.current = setShowDeleteAlert;

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);
  const handleCancelEdit = useCallback(() => {
    setEditedTitle(story.title);
    setIsEditingTitle(false);
    if (isNew) {
      setShowDeleteAlertRef.current(true);
    }
  }, [isNew, story.title]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isEditingTitle) {
        const clickedElement = event.target as Node;
        const isClickOutside = rowRef.current && !rowRef.current.contains(clickedElement);

        if (isClickOutside) {
          if (isNew) {
            setShowDeleteAlertRef.current(false);
          } else {
            handleCancelEdit();
          }
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleCancelEdit, isEditingTitle, isNew, rowRef]);

  const handleSaveTitle = async () => {
    if (isNew) {
      if (editedTitle.trim() === '') {
        return;
      }
      onChangeStory({ ...story, title: editedTitle.trim() });
      return;
    }

    if (editedTitle.trim() === '') {
      setEditedTitle(story.title);
      setIsEditingTitle(false);
      return;
    }

    if (editedTitle !== story.title) {
      const updatedStory = { ...story, title: editedTitle };
      const response = await UserStoryService.updateUserStories(story.id, updatedStory);

      if (response?.data) {
        onChangeStory(response.data);
      } else {
        // If update fails, revert to original title
        setEditedTitle(story.title);
      }
    }

    setIsEditingTitle(false);
  };

  useEffect(() => {
    setEditedTitle(story.title);
  }, [story.title]);
  return (
    <div className="text-foreground/90 flex items-center gap-2">
      <div className="flex items-center justify-center rounded-sm bg-green-500/10 p-1 text-green-500">
        <BookOpen size={14} />
      </div>
      {isEditingTitle ? (
        <div className="flex w-full items-center">
          <input
            ref={titleInputRef}
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSaveTitle();
              } else if (e.key === 'Escape') {
                handleCancelEdit();
              }
            }}
            className="border-primary/30 focus:border-primary w-full border-b bg-transparent px-1 outline-hidden"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
          <div className="ml-2 flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleSaveTitle();
              }}
              className="h-6 w-6 text-green-500 hover:bg-green-500/10 hover:text-green-600"
            >
              <Check size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleCancelEdit();
              }}
              className="h-6 w-6 text-red-500 hover:bg-red-500/10 hover:text-red-600"
            >
              <X size={14} />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <span>{story.title}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditingTitle(true);
            }}
            className="ml-1 h-5 w-5 opacity-0 group-hover:opacity-100 hover:bg-transparent hover:opacity-100"
          >
            <Edit2 size={12} className="text-muted-foreground" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default StoryTitle;
