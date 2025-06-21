'use client';
import { Project } from '@/types/project';
import TimeAgo from 'react-timeago';
import React, { useState } from 'react';
import { Copy, Settings, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { getRoleBadgeStyle } from '@/utils/style';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Props = {
  projects: Project[];
};

const ProjectList = ({ projects }: Props) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyToClipboard = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    uniqueName: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/dashboard/project/${uniqueName}`);
    setCopiedId(uniqueName);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-foreground">Project</TableHead>
            <TableHead className="text-foreground">Project ID</TableHead>
            <TableHead className="text-foreground">Team</TableHead>
            <TableHead className="text-foreground">Last Updated</TableHead>
            <TableHead className="text-foreground">Your Role</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            const { title, uniqueName, projectMembers = [], updatedAt, logoUrl } = project;
            const role = projectMembers?.find(
              (member) => member.email === session?.user?.email,
            )?.role;
            const displayMembers = projectMembers.slice(0, 3);
            const remainingMembers = projectMembers.length - 3;

            return (
              <TableRow
                key={uniqueName}
                className="group cursor-pointer"
                onClick={() => router.push(`/dashboard/project/${uniqueName}`)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="bg-background h-8 w-8">
                      <AvatarImage src={logoUrl} alt={title} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {title?.toUpperCase().slice(0, 2) || 'OG'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium capitalize">{title || 'Untitled Project'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <span>@{uniqueName}</span>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:text-foreground h-6 w-6 p-1"
                          onClick={(e) => handleCopyToClipboard(e, uniqueName)}
                        >
                          {copiedId === uniqueName ? <Check size={12} /> : <Copy size={12} />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {copiedId === uniqueName ? 'Copied!' : 'Copy Link'}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
                <TableCell>
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
                                  {member.firstName?.[0]?.toUpperCase() ||
                                    member.email[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </TooltipTrigger>
                            <TooltipContent className="flex flex-col gap-1 p-2">
                              <p className="font-medium">
                                {member.firstName} {member.lastName}
                              </p>
                              <p className="text-muted-foreground text-xs">{member.email}</p>
                              <p className="text-muted-foreground text-xs capitalize">
                                {member.role}
                              </p>
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
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-muted-foreground/80 flex items-center gap-1 text-sm">
                    <TimeAgo date={updatedAt} minPeriod={60} />
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium ${getRoleBadgeStyle(role ?? 'Admin')}`}
                  >
                    {role}
                  </Badge>
                </TableCell>
                <TableCell>
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProjectList;
