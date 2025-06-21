import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import SprintDropdown from './SprintDropdown';
import SprintStatusPopover from './SprintStatusPopover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Edit } from 'lucide-react';
import EditSprintForm, { SprintFormValues } from './EditSprintForm';
import CreateSprintDialog from '../../CreateSprintDialog';
import SprintMoreAction from './SprintMoreAction';
import { Project, Sprint } from '@/types/project';
import { toast } from 'sonner';
import { ProjectService } from '@/services';
import { useMemo, useState } from 'react';
import { formatSprintToMarkdown } from '@/utils/formatMarkdown';
import { HelperService } from '@/services/helper.api';
import { saveAs } from 'file-saver';

type Props = {
  project: Project;
  sprints: Sprint[];
  currentSprint: Sprint;
  setCurrentSprintId: React.Dispatch<React.SetStateAction<string | null>>;
  setSprints: React.Dispatch<React.SetStateAction<Sprint[]>>;
};

const SprintHeader: React.FC<Props> = ({
  project,
  sprints,
  currentSprint,
  setCurrentSprintId,
  setSprints,
}) => {
  const [isEditSprintDialogOpen, setIsEditSprintDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleExportMarkdown = async () => {
    const markdown = formatSprintToMarkdown(currentSprint);
    const filename = currentSprint.name.toLowerCase().replace(/\s+/g, '-');

    try {
      // Convert to DOCX using helper API
      const docxBlob = await HelperService.convertMarkdownToDocx(markdown, `${filename}-export`);
      if (docxBlob) {
        saveAs(docxBlob, `${filename}-export.docx`);
      } else {
        toast.error('Failed to generate DOCX file');
      }
    } catch (error) {
      toast.error('Failed to generate DOCX file');
      console.error('DOCX generation error:', error);
    }
  };
  const handleEditSprint = async (sprintId: string, data: SprintFormValues) => {
    try {
      const response = await ProjectService.updateSprint(sprintId, data);
      if (response?.data) {
        setSprints((prevSprints) =>
          prevSprints.map((sprint) => {
            if (sprint.id === response.data.id) {
              return {
                ...response.data,
                tasks: sprint.tasks,
              };
            }
            return sprint;
          }),
        );
        toast.success('Sprint updated successfully');
        setIsEditSprintDialogOpen(false);
      } else {
        toast.error('Failed to update sprint');
      }
    } catch {
      toast.error('Failed to update sprint');
    }
  };

  const handleDeleteSprint = async (sprintId: string) => {
    try {
      const response = await ProjectService.deleteSprint(sprintId);
      if (response?.data) {
        setSprints((prevSprints) => prevSprints.filter((s) => s.id !== sprintId));
        toast.success('Sprint deleted successfully');
        setIsDeleteDialogOpen(false);
      } else {
        toast.error('Failed to delete sprint');
      }
    } catch {
      toast.error('Failed to delete sprint');
    }
  };

  const estimation = useMemo(() => {
    return currentSprint.tasks?.reduce(
      (acc, task) => acc + task?.stories?.reduce((acc, story) => acc + story?.estimation, 0),
      0,
    );
  }, [currentSprint.tasks]);

  return (
    <div className="border-b p-2 pt-1">
      <div className="bg-background flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <SprintDropdown
            sprints={sprints}
            currentSprint={currentSprint}
            onSelect={setCurrentSprintId}
          />
          <div className="flex items-center justify-center">
            <SprintStatusPopover currentSprint={currentSprint} setSprints={setSprints} />
          </div>
          {estimation ? (
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
              {estimation} <span className="text-xs">hrs</span>
            </Badge>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isEditSprintDialogOpen} onOpenChange={setIsEditSprintDialogOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    <Edit size={14} />
                    <span className="ml-2 text-sm font-light max-sm:hidden">Edit</span>
                  </Button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit Sprint</p>
              </TooltipContent>
            </Tooltip>
            <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Sprint</DialogTitle>
              </DialogHeader>
              <EditSprintForm
                sprint={currentSprint}
                members={project.projectMembers ?? []}
                onSubmit={handleEditSprint}
              />
            </DialogContent>
          </Dialog>
          <CreateSprintDialog
            onSuccess={(sprint) => {
              setSprints([sprint, ...sprints]);
              setCurrentSprintId(sprint.id);
            }}
            project={project}
          />
          <SprintMoreAction
            isDeleteDialogOpen={isDeleteDialogOpen}
            setIsDeleteDialogOpen={setIsDeleteDialogOpen}
            handleDeleteSprint={() => handleDeleteSprint(currentSprint.id)}
            handleExportMarkdown={handleExportMarkdown}
          />
        </div>
      </div>
      <p className="text-muted-foreground text-xs">
        {format(new Date(currentSprint.startDate), 'MMM dd')} -{' '}
        {format(new Date(currentSprint.endDate), 'MMM dd')}
      </p>
    </div>
  );
};

export default SprintHeader;
