import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Archive, Video } from 'lucide-react';
import { LayoutDashboard, LogOut, Settings } from 'lucide-react';
import { FeatureFlag, useFeatureFlag } from '@/hooks/useFeatureFlags';

const ProfileDropdown = ({ setOpen }: { setOpen: (open: boolean) => void }) => {
  const { data: session } = useSession();
  const isClientEnabled = useFeatureFlag(FeatureFlag.CLIENT_DASHBOARD);
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session?.user?.image || ''} />
            <AvatarFallback>
              {session?.user?.name
                ? session?.user?.name
                    .split(' ')
                    .map((word) => word[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : 'OG'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {isClientEnabled && (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push('/dashboard/client')}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Client Dashboard
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => router.push('/dashboard/archived')}
        >
          <Archive className="mr-2 h-4 w-4" />
          Archived Projects
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => router.push('/dashboard/meetings')}
        >
          <Video className="mr-2 h-4 w-4" />
          Meetings
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => router.push('/dashboard/settings')}
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setOpen(true);
          }}
          className="cursor-pointer text-red-600 hover:text-red-600!"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
