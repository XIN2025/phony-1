import { useState } from 'react';
import { ProjectResource } from '@/types/project-resource';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link as LinkIcon, Loader2, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { resourceTypes } from './resource-types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ResourceCardProps {
  resource: ProjectResource;
  onDelete: () => Promise<void>;
  onEdit: () => void;
}

export const ResourceCard = ({ resource, onDelete, onEdit }: ResourceCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const Icon = resourceTypes.find((t) => t.id === resource.resourceType)?.icon || LinkIcon;
  let hostname = new URL(resource.resourceURL).hostname;
  if (hostname.includes('opengig-meeting-recordings.s3')) {
    hostname = 'heizen.work';
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete();
    setIsDeleting(false);
    setIsOpen(false);
  };

  return (
    <>
      <Link href={resource.resourceURL} target="_blank" rel="noopener noreferrer" className="block">
        <Card
          className={cn(
            'border-border bg-accent/60 relative border transition-all duration-200',
            'hover:bg-accent/55 hover:shadow-xs',
            'group p-4',
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 rounded-lg p-2.5">
                <Icon className="text-primary h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="line-clamp-1 font-medium">{resource.resourceName}</h3>
                <div className="text-muted-foreground mt-1 flex gap-2 text-xs">
                  {resource.updatedAt && resource.updatedAt !== resource.createdAt ? (
                    <span>Updated {formatDistanceToNow(new Date(resource.updatedAt))} ago</span>
                  ) : (
                    <span>Created {formatDistanceToNow(new Date(resource.createdAt))} ago</span>
                  )}
                </div>
                <p className="text-muted-foreground mt-2 text-sm">{hostname}</p>
              </div>
            </div>

            <div>
              <Button
                variant="ghost"
                size="icon"
                className={'h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100'}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onEdit();
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100',
                  'hover:bg-destructive/10 hover:text-destructive',
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIsOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </Link>
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this resource? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
            >
              {isDeleting && <Loader2 className="mr-2 animate-spin" size={20} />}
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
