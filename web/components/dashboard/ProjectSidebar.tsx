'use client';
import Link from 'next/link';
import {
  Settings,
  Package,
  FolderKanban,
  Video,
  Palette,
  KeyRound,
  BookOpen,
  Bug,
  Bot,
  ChevronRight,
  KanbanSquare,
  Clock,
  ChevronLeft,
  X,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { usePathname } from 'next/navigation';
import { FeatureFlag, useActiveFeatureFlags } from '@/hooks/useFeatureFlags';
import { useFeatureFlagStore } from '@/stores/useFeatureFlagStore';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { useWorklog } from '@/contexts/worklog.context';
import { cn } from '@/lib/utils';
import { usePreferencesStore } from '@/stores/usePreferencesStore';

interface ProjectSidebarProps {
  projectName: string;
  children: React.ReactNode;
}

export default function ProjectSidebar({ children, projectName }: ProjectSidebarProps) {
  const { sidebarOpen, setSidebarOpen } = usePreferencesStore();
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1050) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);
  return (
    <SidebarProvider
      open={sidebarOpen}
      onOpenChange={setSidebarOpen}
      className="max-h-[calc(100dvh-44px)]! min-h-[calc(100dvh-44px)]!"
    >
      <ProjectSidebarComponent projectName={projectName}>{children}</ProjectSidebarComponent>
    </SidebarProvider>
  );
}

type ProjectSidebarItem = {
  name: string;
  link: string;
  icon: React.ReactNode;
  isEnabled: boolean;
  items?: {
    title: string;
    link: string;
  }[];
};

function ProjectSidebarComponent({ projectName, children }: ProjectSidebarProps) {
  const { setOpenMobile, open, openMobile, setOpen, isMobile } = useSidebar();
  const pathname = usePathname();
  const flags = useActiveFeatureFlags();
  const isUserApproved = useFeatureFlagStore().isUserApproved;
  const isWorklogUser = useWorklog().isWorklogUser;

  const navItems: ProjectSidebarItem[] = [
    {
      icon: <Package className="h-7 w-7" />,
      name: 'Sprint Board',
      link: `/dashboard/project/${projectName}`,
      isEnabled: true,
    },
    {
      name: 'Backlog',
      link: `/dashboard/project/${projectName}/backlog`,
      icon: <KanbanSquare className="h-7 w-7" />,
      isEnabled: true,
    },
    {
      name: 'Wiki',
      link: `/dashboard/project/${projectName}/wiki`,
      icon: <BookOpen className="h-7 w-7" />,
      isEnabled: true,
    },
    {
      name: 'Bug Tracker',
      link: `/dashboard/project/${projectName}/bugs`,
      icon: <Bug className="h-7 w-7" />,
      isEnabled: true,
    },
    {
      icon: <Palette className="h-7 w-7" />,
      name: 'Project Design',
      link: `/dashboard/project/${projectName}/design`,
      isEnabled: isUserApproved || flags.includes(FeatureFlag.DESIGN_AGENT),
    },
    {
      icon: <FolderKanban className="h-7 w-7" />,
      name: 'Resources',
      link: `/dashboard/project/${projectName}/resources`,
      isEnabled: isUserApproved || flags.includes(FeatureFlag.RESOURCES),
    },
    {
      icon: <Video className="h-7 w-7" />,
      name: 'Meetings',
      link: `/dashboard/project/${projectName}/meetings`,
      isEnabled: isUserApproved || flags.includes(FeatureFlag.MEETING),
    },
    {
      icon: <KeyRound className="h-7 w-7" />,
      name: 'Secrets',
      link: `/dashboard/project/${projectName}/secrets`,
      isEnabled: isUserApproved || flags.includes(FeatureFlag.SECRETS),
    },
    {
      icon: <Clock className="h-7 w-7" />,
      name: 'Work Logs',
      link: `/dashboard/project/${projectName}/logs`,
      isEnabled: isWorklogUser,
    },
    {
      icon: <Bot className="h-7 w-7" />,
      name: 'Chat',
      link: `/dashboard/project/${projectName}/chat`,
      isEnabled: true,
    },
    {
      icon: <Settings className="h-7 w-7" />,
      name: 'Settings',
      link: `/dashboard/project/${projectName}/settings`,
      isEnabled: true,
    },
  ];

  return (
    <>
      <Sidebar variant="sidebar" collapsible="icon" className="bottom-0! max-h-[calc(100dvh-44px)]">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="flex justify-end"
                onClick={() => {
                  if (isMobile) {
                    setOpenMobile(!openMobile);
                  } else {
                    setOpen(!open);
                  }
                }}
              >
                {isMobile ? (
                  <X className="h-7 w-7" />
                ) : (
                  <ChevronLeft className={`${open ? '' : 'rotate-180'}`} />
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarGroup className="gap-3">
              {navItems
                .filter((item) => item.isEnabled)
                .map((item) =>
                  item.items ? (
                    <Collapsible
                      key={item.name}
                      asChild
                      defaultOpen={true}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.name}>
                            {item.icon}
                            <span>{item.name}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items?.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild>
                                  <Link href={subItem.link}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ) : (
                    <SidebarMenuItem key={item.name}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            asChild
                            className={`${item.link === pathname ? 'bg-primary text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground' : ''}`}
                          >
                            <Link
                              href={item.link}
                              onClick={() => setOpenMobile(false)}
                              className="gap-3"
                            >
                              {item.icon}
                              <span>{item.name}</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-xs">
                          {item.name}
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  ),
                )}
            </SidebarGroup>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="bg-background flex max-h-[calc(100dvh-44px)] min-h-[calc(100dvh-44px)]! flex-col overflow-hidden px-2 sm:px-6">
        {isMobile && (
          <div className="bg-background sticky top-0 z-10 flex h-10 w-full items-center border-b">
            <SidebarTrigger />
          </div>
        )}
        <div className={cn('flex flex-1 flex-col overflow-y-auto')}>{children}</div>
      </SidebarInset>
    </>
  );
}
