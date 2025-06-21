'use client';
import { Project } from '@/types/project';
import { useParams, useRouter, usePathname } from 'next/navigation';
import React, { useState } from 'react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ChevronDown, Plus, Shield, Sun, Moon, Search } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Image from 'next/image';
import { useGlobalSearch } from '@/contexts/global-search.context';
import { cn } from '@/lib/utils';

type GlobalHeaderProps = {
  projects: Project[];
};

const GlobalHeader = ({ projects }: GlobalHeaderProps) => {
  const { name: projectUniqueName } = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [projectPopoverOpen, setProjectPopoverOpen] = useState(false);
  const { setOpen: setGlobalSearchOpen } = useGlobalSearch();

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'j' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setProjectPopoverOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isAdmin = session?.role === 'admin';

  // Find current project
  const currentProject = projectUniqueName
    ? projects.find((p) => p.uniqueName === projectUniqueName)
    : null;

  // Extract page name from pathname
  const getPageName = () => {
    if (!currentProject) return null;

    const pathSegments = pathname.split('/');
    const projectIndex = pathSegments.findIndex((segment) => segment === projectUniqueName);
    const pageSegment = pathSegments[projectIndex + 1];

    if (!pageSegment) return null;

    // Capitalize first letter and handle special cases
    return pageSegment.charAt(0).toUpperCase() + pageSegment.slice(1);
  };

  const pageName = getPageName();

  return (
    <header
      className={cn('bg-sidebar flex h-11 items-center justify-between px-2 sm:px-6', 'border-b')}
    >
      <div className="flex items-center">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href="/dashboard"
                  className="text-foreground/80 hover:text-foreground flex items-center gap-2 font-semibold"
                >
                  <Image
                    src={'https://d2iyl9s54la9ej.cloudfront.net/heizen.png'}
                    alt="Curie"
                    width={100}
                    height={100}
                    className="size-5 rounded"
                  />
                  Heizen
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {currentProject && (
              <>
                <BreadcrumbSeparator className="max-sm:hidden" />
                <BreadcrumbItem className="max-sm:hidden">
                  <div className="flex items-center gap-1">
                    <BreadcrumbLink asChild>
                      <Link
                        href={`/dashboard/project/${projectUniqueName}`}
                        className="text-foreground/80 hover:text-foreground font-medium"
                      >
                        {currentProject.title}
                      </Link>
                    </BreadcrumbLink>

                    <Popover open={projectPopoverOpen} onOpenChange={setProjectPopoverOpen}>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <PopoverTrigger asChild>
                            <button className="-mr-2 px-1 py-2">
                              <ChevronDown className="h-3 w-3" />
                            </button>
                          </PopoverTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" align="center">
                          <div className="flex items-center gap-2">
                            Switch Project
                            <kbd className="bg-muted pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100">
                              <span className="text-xs">⌘</span>J
                            </kbd>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                      <PopoverContent align="start" className="w-56 p-0">
                        <Command>
                          <CommandInput placeholder="Search projects..." />
                          <CommandList>
                            <CommandEmpty>No project found.</CommandEmpty>
                            <CommandGroup>
                              {projects.map((project) => (
                                <CommandItem
                                  key={project.id}
                                  value={project.title}
                                  onSelect={() => {
                                    router.push(`/dashboard/project/${project.uniqueName}`);
                                    setProjectPopoverOpen(false);
                                  }}
                                >
                                  <span className="font-medium">{project.title}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </BreadcrumbItem>

                {pageName && (
                  <>
                    <BreadcrumbSeparator className="max-sm:hidden" />
                    <BreadcrumbItem className="max-sm:hidden">
                      <BreadcrumbPage className="text-foreground/80 hover:text-foreground font-medium">
                        {pageName}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <Button
        variant="outline"
        className="text-muted-foreground relative h-8 w-full justify-start rounded-[0.5rem] text-sm max-sm:hidden sm:w-[50%] sm:pr-12 lg:w-[30%]"
        onClick={() => setGlobalSearchOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="inline-flex">Search events, tasks, intakes...</span>
        <kbd className="bg-muted pointer-events-none absolute right-1.5 hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 sm:hidden"
          onClick={() => setGlobalSearchOpen(true)}
        >
          <Search className="h-4 w-4" />
        </Button>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Link href="/dashboard/create">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4" />
                <span className="sr-only">Create Project</span>
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="center">
            Create Project
          </TooltipContent>
        </Tooltip>

        {isAdmin && (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Link href="/dashboard/admin">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Shield className="h-4 w-4" />
                  <span className="sr-only">Admin Panel</span>
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="center">
              Admin Panel
            </TooltipContent>
          </Tooltip>
        )}
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-4 w-4 scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="center">
            Toggle Theme
          </TooltipContent>
        </Tooltip>
        <ProfileDropdown setOpen={(open) => setOpen(open)} />
      </div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will log you out of your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await signOut({ callbackUrl: '/' });
              }}
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
};

export default GlobalHeader;
