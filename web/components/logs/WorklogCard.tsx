import React, { useState } from 'react';
import { WorklogDto } from '@/types/worklog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Clock, Bug, FileText, Calendar, Users, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { WorklogEditDialog } from './WorklogEditDialog';

interface WorklogCardProps {
  worklog: WorklogDto;
  onUpdate?: (updatedWorklog: WorklogDto) => void;
  onDelete?: (worklogId: string) => void;
}

export const WorklogCard: React.FC<WorklogCardProps> = ({ worklog, onUpdate, onDelete }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const getWorklogType = () => {
    if (worklog.bug) return { type: 'Bug', icon: Bug, color: 'bg-red-500' };
    if (worklog.story) return { type: 'Story', icon: FileText, color: 'bg-blue-500' };
    if (worklog.meeting) return { type: 'Meeting', icon: Users, color: 'bg-green-500' };
    if (worklog.wiki) return { type: 'Wiki', icon: FileText, color: 'bg-purple-500' };
    return { type: 'General', icon: Clock, color: 'bg-gray-500' };
  };

  const worklogType = getWorklogType();
  const IconComponent = worklogType.icon;

  const getWorklogTitle = () => {
    if (worklog.bug) return worklog.bug.title;
    if (worklog.story) return worklog.story.title;
    if (worklog.meeting) return worklog.meeting.title;
    if (worklog.wiki) return worklog.wiki.title;
    return 'General Work';
  };

  const getWorklogDescription = () => {
    if (worklog.description) return worklog.description;
    if (worklog.bug) return worklog.bug.summary;
    if (worklog.story) return worklog.story.description;
    return 'No description provided';
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(worklog.id);
    }
    setIsDeleteDialogOpen(false);
  };

  const handleUpdate = (updatedWorklog: WorklogDto) => {
    if (onUpdate) {
      onUpdate(updatedWorklog);
    }
    setIsEditDialogOpen(false);
  };

  return (
    <>
      <Card className="w-full transition-shadow duration-200 hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className={`rounded-lg p-2 ${worklogType.color}`}>
                <IconComponent className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="mb-2 truncate text-sm leading-none font-semibold">
                  {getWorklogTitle()}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {worklogType.type}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center space-x-2">
              <div className="bg-primary/10 flex items-center rounded-lg px-3 py-2">
                <Clock className="text-primary mr-1 h-4 w-4" />
                <span className="text-primary text-sm font-semibold">{worklog.hoursWorked}h</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditDialogOpen(true)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this worklog entry.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            <p className="text-muted-foreground line-clamp-2 text-sm">{getWorklogDescription()}</p>

            <div className="text-muted-foreground flex items-center text-xs">
              <Calendar className="mr-1 h-3 w-3" />
              {format(new Date(worklog.date), 'MMM dd, yyyy')}
            </div>
          </div>
        </CardContent>
      </Card>

      <WorklogEditDialog
        worklog={worklog}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdate={handleUpdate}
      />
    </>
  );
};
