import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2, LockIcon } from 'lucide-react';
import { ProjectMember } from '@/types/project';
import { WikiAccessLevel } from '@/types/wiki';
import { WikiService } from '@/services/wiki.api';
import { toast } from 'sonner';

// const WikiAccessUser = ({ member }: { member: ProjectMember }) => {
//   const { data: session } = useSession();
//   return (
//     <div className="flex items-center justify-between">
//       <div className="flex items-center gap-2">
//         <Avatar>
//           <AvatarImage src={member.avatarUrl} />
//           <AvatarFallback>
//             {getInitials(`${member.firstName ?? ''} ${member.lastName ?? ''}`)}{' '}
//             {member.email === session?.user?.email ? '(you)' : null}{' '}
//           </AvatarFallback>
//         </Avatar>
//         <div className="flex flex-col">
//           <span className="text-sm">{`${member.firstName ?? ''} ${member.lastName ?? ''}`} </span>
//           <span className="text-muted-foreground text-xs">{member.email}</span>
//         </div>
//       </div>
//       <span className="text-muted-foreground text-sm">{member.role}</span>
//     </div>
//   );
// };

type WikiShareProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  members: ProjectMember[];
  wikiTitle: string;
  isPublic: boolean;
  public_access_level?: WikiAccessLevel;
  wikiId: string;
};

const WikiShare = ({
  isOpen,
  onOpenChange,
  wikiTitle,
  isPublic,
  public_access_level,
  wikiId,
}: WikiShareProps) => {
  const [access, setAccess] = useState<string>(isPublic ? 'anyone' : 'restricted');
  const [accessType, setAccessType] = useState<string>(public_access_level ?? 'View');
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleDone = async () => {
    try {
      setIsLoading(true);
      const res = await WikiService.updateAccessById(wikiId, {
        access_level: accessType as WikiAccessLevel,
        is_public: access === 'anyone',
      });
      if (res.data) {
        onOpenChange(false);
      } else {
        toast.error(res?.error?.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Share &apos;{wikiTitle || 'Untitled'}&apos;</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          {/* <Input placeholder="Add people, groups and calendar events" className="w-full" />

          <div className="space-y-4">
            <h4 className="text-sm font-medium">People with access</h4>

            {members.map((member) => (
              <WikiAccessUser key={member.id} member={member} />
            ))}
          </div> */}

          <div className="space-y-4">
            <h4 className="text-sm font-medium">General access</h4>
            <div className="flex items-center gap-2">
              <LockIcon className="h-4 w-4" />
              <Select
                value={access}
                onValueChange={(value) => {
                  setAccess(value);
                }}
              >
                <SelectTrigger className="h-9 w-fit">
                  <SelectValue placeholder="Select access" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restricted">Restricted</SelectItem>
                  <SelectItem value="anyone">Anyone with link</SelectItem>
                </SelectContent>
              </Select>
              {access === 'anyone' && (
                <div className="ml-auto flex items-center gap-2">
                  <div className="text-sm">Access Level:</div>
                  <Select
                    value={accessType}
                    onValueChange={(value) => {
                      setAccessType(value);
                    }}
                  >
                    <SelectTrigger className="h-9 w-fit">
                      <SelectValue placeholder="Select access" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="View">View</SelectItem>
                      <SelectItem value="Comment">Comment</SelectItem>
                      <SelectItem value="Edit">Edit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            {access === 'restricted' ? (
              <p className="text-muted-foreground text-xs">Only people with access can open</p>
            ) : (
              <p className="text-muted-foreground text-xs">Anyone with the link can open</p>
            )}
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/wiki/${wikiId}`);
              setIsCopied(true);
              setTimeout(() => {
                setIsCopied(false);
              }, 2000);
            }}
          >
            {isCopied ? 'Copied' : 'Copy link'}
          </Button>
          <Button
            onClick={() => {
              handleDone();
            }}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Done'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WikiShare;
