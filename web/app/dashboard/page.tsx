'use client';
import ProjectCard from '@/components/dashboard/ProjectCard';
import ProjectList from '@/components/dashboard/ProjectList';
import LoadingScreen from '@/components/LoadingScreen';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { LayoutGrid, List, Power } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { FolderKanban } from 'lucide-react';
import Link from 'next/link';
import { useProjectStore } from '@/stores/useProjectStore';
import { usePreferencesStore } from '@/stores/usePreferencesStore';
import AudioRecorder from '@/components/AudioRecorder';
import { Switch } from '@/components/ui/switch';

export default function DashboardPage() {
  const { projects, loading, fetchProjects } = useProjectStore();
  const { isListView, setIsListView, sortBy, setSortBy, showActiveOnly, setShowActiveOnly } =
    usePreferencesStore();

  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { data, status } = useSession();

  const sortProjects = useCallback(
    <T extends { title: string; updatedAt: string }>(projectsToSort: T[]) => {
      return [...projectsToSort].sort((a, b) => {
        if (sortBy === 'name') {
          return a.title.localeCompare(b.title);
        } else {
          // Sort by updatedAt in descending order (newest first)
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
      });
    },
    [sortBy],
  );

  useEffect(() => {
    if (!searchQuery) {
      setFilteredProjects(sortProjects(projects));
    } else {
      const searchResults = projects.filter((project) =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredProjects(sortProjects(searchResults));
    }
  }, [searchQuery, projects, sortProjects]);

  useEffect(() => {
    fetchProjects(showActiveOnly);
  }, [fetchProjects, showActiveOnly]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5 px-3 py-10 sm:px-5">
      <div className="flex justify-between gap-4 max-sm:flex-col sm:items-center">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <FolderKanban className="text-primary h-6 w-6" />
            <h1 className="text-xl font-semibold">Projects</h1>
          </div>
          <p className="text-muted-foreground">Manage all your Projects</p>
        </div>
        <div className="flex flex-1 items-center gap-4 sm:max-w-md">
          <AudioRecorder hideText />
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              ref={searchInputRef}
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 pl-9"
            />
            <kbd className="bg-muted pointer-events-none absolute top-2.5 right-2 hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
          <div className="bg-background flex items-center gap-2 rounded-full border p-1">
            <Toggle
              pressed={!isListView}
              onPressedChange={(pressed) => setIsListView(!pressed)}
              aria-label="Toggle grid view"
              className="data-[state=on]:bg-muted rounded-full"
            >
              <LayoutGrid size={18} />
            </Toggle>
            <Toggle
              pressed={isListView}
              onPressedChange={(pressed) => setIsListView(pressed)}
              aria-label="Toggle list view"
              className="data-[state=on]:bg-muted rounded-full"
            >
              <List size={18} />
            </Toggle>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Power
              className={`h-4 w-4 ${showActiveOnly ? 'text-green-500' : 'text-muted-foreground'}`}
            />
            <span className="text-muted-foreground text-sm">Active projects only</span>
            <Switch
              checked={showActiveOnly}
              onCheckedChange={setShowActiveOnly}
              aria-label="Toggle active projects filter"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Sort by:</span>
          <div className="bg-background flex items-center gap-2 rounded-full border p-1">
            <Toggle
              pressed={sortBy === 'name'}
              onPressedChange={() => setSortBy('name')}
              size="sm"
              aria-label="Sort by name"
              className="data-[state=on]:bg-muted h-8 rounded-full text-sm"
            >
              Name
            </Toggle>
            <Toggle
              pressed={sortBy === 'updatedAt'}
              onPressedChange={() => setSortBy('updatedAt')}
              size="sm"
              aria-label="Sort by last updated"
              className="data-[state=on]:bg-muted h-8 rounded-full text-sm"
            >
              Last Updated
            </Toggle>
          </div>
        </div>
      </div>
      {isListView ? (
        <ProjectList projects={filteredProjects} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project, index) => (
            <ProjectCard project={project} key={project.id ?? index} />
          ))}
        </div>
      )}
      {!loading && data && filteredProjects.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
          <div className="text-muted-foreground">
            {searchQuery
              ? 'No matching projects found'
              : showActiveOnly
                ? 'No active projects found'
                : 'No projects found'}
          </div>
          <div className="text-muted-foreground max-w-md text-sm">
            {showActiveOnly
              ? 'Try disabling the active filter or create a new project to start recording your meetings and generate requirements automatically.'
              : 'Create a new project to start recording your meetings and generate requirements automatically.'}
          </div>
          <Link
            href="/dashboard/create"
            className="bg-primary hover:bg-primary/90 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white"
          >
            <FolderKanban size={16} />
            Create your first project
          </Link>
        </div>
      )}
      {(loading || status == 'loading') && !projects.length && <LoadingScreen type="logo" />}
    </div>
  );
}
