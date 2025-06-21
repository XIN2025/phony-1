import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { GenerateRequirementForm } from './GenerateRequiementForm';
import { StoryFormValues } from '@/lib/validations/story-form';
import { MeetingDataService } from '@/services';
import { MeetingData } from '@/types/meeting-data';
import { Project } from '@/types/project';
import { Wand2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';

type Props = {
  meeting: MeetingData;
  project: Project;
};

const GenerateRequirementDialog: React.FC<Props> = ({ meeting, project }) => {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const handleGenerateStories = async (data: StoryFormValues) => {
    // TODO: Implement story generation logic
    try {
      const formData = new FormData();
      formData.append('projectId', project.id);
      formData.append('sprintOption', data.sprintOption);
      formData.append('storyInput', data.storyInput);
      formData.append('summary', meeting.summary ?? '');
      formData.append('meetingId', meeting.id);

      // Add file if provided
      if (data.files?.[0]) {
        formData.append('file', data.files[0]);
      }
      const res = await MeetingDataService.generateUserStories(formData);
      if (res.error) {
        toast.error('Failed to generate stories', {
          description: res.error.message,
        });
        return;
      }
      if (data.sprintOption === 'backlog') {
        toast.success('Successfully generated requirements!', {
          description: 'Your tasks have been added to the project backlog for future sprints.',
        });
        router.push(`/dashboard/project/${project.uniqueName}/backlog`);
      } else {
        toast.success('Requirements generated successfully!', {
          description:
            'Your tasks have been added to the current sprint and are ready for development.',
        });
        router.push(`/dashboard/project/${project.uniqueName}`);
      }
    } catch {
      toast.error('Failed to generate stories');
    }
  };

  if (meeting.isStoriesCreated) {
    return (
      <Link href={`/dashboard/project/${project.uniqueName}`} className="flex-1">
        <Button size="sm" variant={'outline'} className="h-8 w-full text-sm font-normal">
          View Requirement
        </Button>
      </Link>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 flex-1 text-sm font-normal">
          <Wand2 size={14} className="mr-2" />
          Generate Requirement
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Requirement</DialogTitle>
          <DialogDescription>
            Create a new requirement based on your meeting data.
          </DialogDescription>
        </DialogHeader>
        <GenerateRequirementForm
          project={project}
          onSubmit={handleGenerateStories}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default GenerateRequirementDialog;
