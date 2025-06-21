'use client';
import { Project } from '@/types/project';
import TimeAgo from 'react-timeago';
import Link from 'next/link';
import React from 'react';
import { Settings, User } from 'lucide-react';
import { Button } from '../ui/button';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { getRoleBadgeStyle } from '@/utils/style';

type Props = {
  project: Project;
};

const ProjectCard = (props: Props) => {
  const { data: session } = useSession();
  const { title, uniqueName, projectMembers = [], updatedAt, logoUrl } = props.project;
  const role = projectMembers?.find((member) => member.email === session?.user?.email)?.role;
  const router = useRouter();

  const displayMembers = projectMembers.slice(0, 3);
  const remainingMembers = projectMembers.length - 3;

  return (
    <Link
      href={`/dashboard/project/${uniqueName}`}
      className="group border-border/40 from-sidebar to-sidebar/40 hover:border-border relative overflow-hidden rounded-xl border-2 bg-linear-to-br transition-colors"
    >
      <div className="flex flex-col gap-3 p-5">
        {/* Main Content Section */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={logoUrl} alt={title} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {title?.toUpperCase().slice(0, 2) || 'OG'}
                </AvatarFallback>
              </Avatar>
              <span className="text-lg font-semibold tracking-tight capitalize">
                {title || 'Untitled Project'}
              </span>
            </div>
          </div>

          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/dashboard/project/${uniqueName}/settings`);
            }}
            size="icon"
            variant="ghost"
            className="text-muted-foreground hover:text-primary h-8 w-8"
            aria-label="Project Settings"
          >
            <Settings size={16} />
          </Button>
        </div>
        <Badge
          variant="outline"
          className={`w-fit gap-1 text-xs font-medium ${getRoleBadgeStyle(role ?? 'Admin')}`}
        >
          <User size={15} />
          {role}
        </Badge>

        {/* Footer Section */}
        <div className="flex items-center justify-between">
          {/* Team Members */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {displayMembers.map((member) => (
                <TooltipProvider key={member.id} delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar className="border-background ring-primary/5 h-7 w-7 border-2 ring-2">
                        <AvatarImage
                          src={member.avatarUrl}
                          alt={member.firstName || member.email}
                        />
                        <AvatarFallback className="text-primary bg-violet-100 dark:bg-violet-900 dark:text-white">
                          {member.firstName?.[0]?.toUpperCase() || member.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent className="flex flex-col gap-1 p-2">
                      <p className="font-medium">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-muted-foreground text-xs">{member.email}</p>
                      <p className="text-muted-foreground text-xs capitalize">{member.role}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
              {remainingMembers > 0 && (
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar className="border-background ring-primary/5 h-7 w-7 border-2 ring-2">
                        <AvatarFallback className="text-primary bg-violet-100 dark:bg-violet-900 dark:text-white">
                          +{remainingMembers}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">And {remainingMembers} more members</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <span className="text-muted-foreground text-sm">
              {projectMembers.length} {projectMembers.length === 1 ? 'member' : 'members'}
            </span>
          </div>

          {/* Date */}
          <div className="text-muted-foreground/80 flex items-center gap-1 text-sm">
            Edited
            <TimeAgo date={updatedAt} minPeriod={60} />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
