import ButtonWithLoading from '@/components/ButtonWithLoading';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { GithubService } from '@/services';
import type { GithubBranch, GithubOwner, GithubRepository } from '@/types/github';
import { GithubRepo, Project } from '@/types/project';
import { format } from 'date-fns';
import { ChevronRight, GitBranch, Search, Star } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ImportRepoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  setProject: React.Dispatch<React.SetStateAction<Project>>;
}

const ImportRepoDialog = ({ open, onOpenChange, project, setProject }: ImportRepoDialogProps) => {
  const [loading, setLoading] = useState({
    owners: false,
    repos: false,
    branches: false,
  });
  const [githubOwner, setGithubOwner] = useState('');
  const [githubRepo, setGithubRepo] = useState({
    name: '',
    owner: '',
  });
  const [githubBranch, setGithubBranch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [owners, setOwners] = useState<GithubOwner[]>([]);
  const [repositories, setRepositories] = useState<GithubRepository[]>([]);
  const [branches, setBranches] = useState<GithubBranch[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [repoPage, setRepoPage] = useState<number | null>(1);
  const [branchPage, setBranchPage] = useState<number | null>(1);
  const [submitting, setSubmitting] = useState(false);

  const loadMoreRepos = async () => {
    if (!githubOwner || !repoPage) return;
    const data = await GithubService.getGithubRepositories(
      githubOwner,
      owners.find((o) => o.login === githubOwner)?.type || 'User',
      repoPage,
    );
    if (data.data) {
      setRepositories([...repositories, ...data.data.data]);
      setRepoPage(data.data.nextPage);
    } else {
      toast.error(data.error.message);
    }
  };

  const loadMoreBranches = async () => {
    if (!githubOwner || !githubRepo.name || !branchPage) return;
    const data = await GithubService.getGithubBranches(
      githubRepo.owner,
      githubRepo.name,
      branchPage,
    );
    if (data.data) {
      setBranches([...branches, ...data.data.data]);
      setBranchPage(data.data.nextPage);
    } else {
      toast.error(data.error.message);
    }
  };

  useEffect(() => {
    const fetchOwners = async () => {
      const data = await GithubService.getGithubOwners();
      if (data.data) {
        setOwners(data.data);
      } else {
        toast.error(data.error.message);
      }
    };
    fetchOwners();
  }, []);

  useEffect(() => {
    const fetchRepositories = async () => {
      if (!githubOwner) return;
      setLoading((prev) => ({ ...prev, repos: true }));
      const data = await GithubService.getGithubRepositories(
        githubOwner,
        owners.find((o) => o.login === githubOwner)?.type || 'User',
      );
      if (data.data) {
        setRepositories(data.data.data);
        setRepoPage(data.data.nextPage);
      } else {
        toast.error(data.error.message);
      }
      setLoading((prev) => ({ ...prev, repos: false }));
    };
    fetchRepositories();
  }, [githubOwner, owners]);

  useEffect(() => {
    const fetchBranches = async () => {
      if (!githubOwner || !githubRepo.name) return;
      setLoading((prev) => ({ ...prev, branches: true }));
      const data = await GithubService.getGithubBranches(githubRepo.owner, githubRepo.name);
      if (data.data) {
        setBranches(data.data.data);
        setBranchPage(data.data.nextPage);
        setGithubBranch(data.data.data.find((branch) => branch.isDefault)?.name || '');
      } else {
        toast.error(data.error.message);
      }
      setLoading((prev) => ({ ...prev, branches: false }));
    };
    fetchBranches();
  }, [githubOwner, githubRepo]);

  const handleLoadMoreRepos = async () => {
    if (!repoPage) return;
    setLoadingMore(true);
    await loadMoreRepos();
    setLoadingMore(false);
  };

  const handleLoadMoreBranches = async () => {
    if (!branchPage) return;
    setLoadingMore(true);
    await loadMoreBranches();
    setLoadingMore(false);
  };

  const handleConnect = async () => {
    setSubmitting(true);
    try {
      const res = await GithubService.connectGithubRepo({
        githubBranch,
        githubRepo: githubRepo.name,
        githubOwner: githubRepo.owner,
        projectId: project.id,
      });
      if (res.data) {
        setProject((prev) => ({ ...prev, githubRepos: [res.data] as GithubRepo[] }));
        onOpenChange(false);
        toast.success('Repository connected successfully');
      } else {
        toast.error(res.error?.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    if (!githubOwner) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {loading.owners
              ? Array(4)
                  .fill(0)
                  .map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
              : owners.map((owner) => (
                  <div
                    key={owner.id}
                    onClick={() => setGithubOwner(owner.login)}
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
          <div className="bg-background sticky top-0 flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setGithubOwner('')}>
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
            <div className="relative w-64">
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
              : repositories.map((repo) => (
                  <div
                    key={repo.id}
                    onClick={() => setGithubRepo({ name: repo.name, owner: repo.owner })}
                    className="bg-accent/40 hover:border-primary cursor-pointer space-y-3 rounded-lg border p-4 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">
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
                    <div className="text-muted-foreground flex items-center gap-4 text-sm">
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
            {!!repoPage && !loading.repos && (
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
              onClick={() => setGithubRepo({ name: '', owner: '' })}
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
                  onClick={() => setGithubBranch(branch.name)}
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
          {!!branchPage && !loading.branches && (
            <Button variant="outline" onClick={handleLoadMoreBranches} disabled={loadingMore}>
              Load More
            </Button>
          )}
        </div>
        <div className="flex justify-end">
          <ButtonWithLoading loading={submitting} onClick={handleConnect}>
            Connect
          </ButtonWithLoading>
        </div>
      </div>
    );
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Repo</DialogTitle>
        </DialogHeader>
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
};

export default ImportRepoDialog;
