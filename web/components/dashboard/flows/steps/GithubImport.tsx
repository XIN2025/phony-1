import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Sparkles, Star, GitBranch, ChevronRight, Search } from 'lucide-react';
import React, { useState } from 'react';
import { ProjectData } from '../../ProjectCreationFlow';
import { type GithubOwner, type GithubRepository, type GithubBranch } from '@/types/github';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useGithub } from '@/hooks/useGithub';
import Link from 'next/link';

type GithubImportProps = {
  projectData: ProjectData;
  setProjectData: (data: ProjectData) => void;
  owners: GithubOwner[];
  repositories: GithubRepository[];
  branches: GithubBranch[];
  loading: {
    owners: boolean;
    repos: boolean;
    branches: boolean;
  };
  onBack: () => void;
  onNext: () => void;
  loadMoreRepos: () => Promise<void>;
  loadMoreBranches: () => Promise<void>;
  hasNextRepoPage: boolean;
  hasNextBranchPage: boolean;
};

const GithubImport = ({
  projectData,
  setProjectData,
  owners,
  repositories,
  branches,
  loading,
  onBack,
  onNext,
  loadMoreRepos,
  loadMoreBranches,
  hasNextRepoPage,
  hasNextBranchPage,
}: GithubImportProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { githubOwner, githubRepo, githubBranch } = projectData;
  const { githubStatus } = useGithub();
  const [loadingMore, setLoadingMore] = useState(false);

  const filteredOwners = owners.filter((owner) =>
    owner.login.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredRepos = repositories.filter((repo) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleLoadMoreRepos = async () => {
    if (!hasNextRepoPage) return;
    setLoadingMore(true);
    await loadMoreRepos();
    setLoadingMore(false);
  };

  const handleLoadMoreBranches = async () => {
    if (!hasNextBranchPage) return;
    setLoadingMore(true);
    await loadMoreBranches();
    setLoadingMore(false);
  };

  const renderStep = () => {
    if (!githubOwner) {
      return (
        <div className="space-y-4">
          <div className="bg-background sticky top-0">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-5 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search organizations or users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {loading.owners
              ? Array(4)
                  .fill(0)
                  .map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
              : filteredOwners.map((owner) => (
                  <div
                    key={owner.id}
                    onClick={() => setProjectData({ ...projectData, githubOwner: owner.login })}
                    className="bg-accent/40 hover:border-primary flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-all"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={owner.avatarUrl} />
                      <AvatarFallback>{owner.login.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{owner.login}</p>
                      <p className="text-muted-foreground text-sm">{owner.type}</p>
                    </div>
                    <ChevronRight className="text-muted-foreground ml-auto h-5 w-5" />
                  </div>
                ))}
          </div>
        </div>
      );
    }

    if (!githubRepo.name) {
      return (
        <div className="space-y-4">
          <div className="bg-background sticky top-0 flex flex-wrap items-center justify-between sm:p-2">
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setProjectData({ ...projectData, githubOwner: '' })}
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </Button>
              <div className="flex items-center gap-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={owners.find((o) => o.login === githubOwner)?.avatarUrl} />
                  <AvatarFallback>{githubOwner.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{githubOwner}</span>
              </div>
            </div>
            <div className="relative mx-2 min-w-64">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="grid gap-3">
            {loading.repos
              ? Array(3)
                  .fill(0)
                  .map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
              : filteredRepos.map((repo) => (
                  <div
                    key={repo.id}
                    onClick={() =>
                      setProjectData({
                        ...projectData,
                        githubRepo: { name: repo.name, owner: repo.owner },
                      })
                    }
                    className="bg-accent/40 hover:border-primary w-full cursor-pointer space-y-3 rounded-lg border p-4 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-medium break-all">
                            {repo.owner}/{repo.name}
                          </h4>
                          {repo.private && (
                            <div className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-500">
                              Private
                            </div>
                          )}
                        </div>
                        {repo.description && (
                          <p className="text-muted-foreground mt-1 text-sm">{repo.description}</p>
                        )}
                      </div>
                      <ChevronRight className="text-muted-foreground h-5 w-5" />
                    </div>
                    <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
                      {repo.language && (
                        <span className="flex items-center gap-1.5">
                          <span className="bg-primary h-2.5 w-2.5 rounded-full" />
                          {repo.language}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Star className="h-4 w-4" />
                        {repo.stargazersCount}
                      </span>
                      <span>Updated {format(new Date(repo.updatedAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                ))}
            {hasNextRepoPage && !loading.repos && (
              <Button variant="outline" onClick={handleLoadMoreRepos} disabled={loadingMore}>
                Load More
              </Button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="bg-background sticky top-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setProjectData({
                  ...projectData,
                  githubRepo: { name: '', owner: '' },
                })
              }
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
            </Button>
            <div className="flex items-center gap-2 font-medium">
              <span>{githubRepo.owner}</span>
              <span className="text-muted-foreground">/</span>
              <span>{githubRepo.name}</span>
            </div>
          </div>
        </div>
        <div className="grid gap-2">
          {loading.branches
            ? Array(3)
                .fill(0)
                .map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
            : branches.map((branch) => (
                <div
                  key={branch.name}
                  onClick={() => setProjectData({ ...projectData, githubBranch: branch.name })}
                  className={cn(
                    'bg-card hover:border-primary flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all hover:shadow-xs',
                    githubBranch === branch.name && 'border-primary bg-primary/5',
                  )}
                >
                  <GitBranch className="h-4 w-4" />
                  <span className="font-medium">{branch.name}</span>
                  {branch.isDefault && (
                    <div className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">
                      Default
                    </div>
                  )}
                  {githubBranch === branch.name && (
                    <div className="bg-primary/10 text-primary ml-auto rounded-full px-2 py-0.5 text-xs font-medium">
                      Selected
                    </div>
                  )}
                </div>
              ))}
          {hasNextBranchPage && !loading.branches && (
            <Button variant="outline" onClick={handleLoadMoreBranches} disabled={loadingMore}>
              Load More
            </Button>
          )}
        </div>
      </div>
    );
  };

  if (!githubStatus) {
    return (
      <div className="space-y-4">
        <div className="bg-card flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-6 shadow-md">
          <p className="text-muted-foreground text-center text-lg font-semibold">
            Please connect your GitHub account to continue
          </p>
          <Link href="/dashboard/settings">
            <Button className="w-full max-w-xs">Connect GitHub Here</Button>
          </Link>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="w-full flex-1" onClick={onBack}>
            Back
          </Button>
          <Button
            className="w-full flex-1"
            disabled={!githubOwner || !githubRepo || !githubBranch}
            onClick={onNext}
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold max-sm:text-lg">Import from GitHub</h2>
        <p className="text-muted-foreground">
          Select a repository to import and start building your project
        </p>
      </div>

      <ScrollArea className="bg-card h-[450px] rounded-lg border p-2 sm:p-6">
        {renderStep()}
        <ScrollBar orientation="vertical" />
      </ScrollArea>

      {projectData.githubUrl && (
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Sparkles className="text-primary mt-1 h-5 w-5" />
              <div className="space-y-1">
                <Label htmlFor="ai-assistant" className="text-primary">
                  Enable AI Assistant
                </Label>
                <p className="text-muted-foreground text-sm">
                  Get intelligent code suggestions and documentation help
                </p>
              </div>
            </div>
            <Switch
              id="ai-assistant"
              checked={projectData.aiAssistantIntegration}
              onCheckedChange={(checked) =>
                setProjectData({ ...projectData, aiAssistantIntegration: checked })
              }
            />
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <Button variant="outline" className="w-full flex-1" onClick={onBack}>
          Back
        </Button>
        <Button
          className="w-full flex-1"
          disabled={!githubOwner || !githubRepo || !githubBranch}
          onClick={onNext}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default GithubImport;
