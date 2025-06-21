import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import { ProjectMember } from '@/types/project';
import { useState } from 'react';
import WikiCommentSheetContent from './WikiCommentSheetContent';
import { Button } from '@/components/ui/button';
import { Wiki } from '@/types/wiki';
import { MessageCircle } from 'lucide-react';

type Props = {
  wiki: Wiki;
  projectMembers: ProjectMember[];
};

const CommentButton = ({ wiki, projectMembers }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" onClick={() => setOpen(true)} size="icon">
          <MessageCircle className="size-4" />
        </Button>
      </SheetTrigger>
      <WikiCommentSheetContent projectMembers={projectMembers} wiki={wiki} />
    </Sheet>
  );
};

export default CommentButton;
