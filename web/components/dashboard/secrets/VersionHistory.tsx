import { SecretVersionListItem } from '@/types/secrets';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface VersionHistoryProps {
  versions: SecretVersionListItem[];
  isOpen: boolean;
  onClose: () => void;
  onViewVersion: (versionNumber: number) => void;
  currentVersion?: number;
}

export function VersionHistory({
  versions,
  isOpen,
  onClose,
  onViewVersion,
  currentVersion,
}: VersionHistoryProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Version History</DialogTitle>
        </DialogHeader>
        {versions.length === 0 ? (
          <div className="text-muted-foreground py-6 text-center text-sm">
            No version history available
          </div>
        ) : (
          <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-4">
            {versions.map((version) => {
              const isCurrent = version.versionNumber === currentVersion;
              return (
                <div
                  key={version.id}
                  onClick={() => onViewVersion(version.versionNumber)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between rounded-lg border-2 p-4 transition-all duration-200',
                    isCurrent
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-secondary hover:border-primary/20',
                  )}
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={version.createdByUser.avatar_url} />
                      <AvatarFallback>
                        {version.createdByUser.first_name[0]}
                        {version.createdByUser.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">Version {version.versionNumber}</span>
                        {isCurrent && (
                          <Badge variant="default" className="text-[10px]">
                            Current
                          </Badge>
                        )}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {format(new Date(version.createdAt), 'MMM d, yyyy h:mm a')} by{' '}
                        {version.createdByUser.first_name} {version.createdByUser.last_name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCurrent && (
                      <Button variant="ghost" size="icon" disabled>
                        <CheckIcon className="text-primary h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
