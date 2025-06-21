'use client';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProjectData } from '../ProjectCreationFlow';
import ButtonWithLoading from '@/components/ButtonWithLoading';
import { toast } from 'sonner';
import GithubImport from './steps/GithubImport';
import { GithubService } from '@/services';
import { GithubOwner, GithubRepository, GithubBranch } from '@/types/github';
import MdxEditorComponent from '@/components/MdxEditor';

type ImportFlowProps = {
  currentStep: number;
  projectData: ProjectData;
  setProjectData: Dispatch<SetStateAction<ProjectData>>;
  onNext: () => void;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
  owners: GithubOwner[];
};

export default function ImportFlow({
  currentStep,
  projectData,
  setProjectData,
  onNext,
  onBack,
  onSubmit,
  loading,
  owners,
}: ImportFlowProps) {
  const localStep = currentStep - 1;
  const [repositories, setRepositories] = useState<GithubRepository[]>([]);
  const [branches, setBranches] = useState<GithubBranch[]>([]);
  const [isLoading, setIsLoading] = useState({
    owners: false,
    repos: false,
    branches: false,
  });
  const { githubOwner, githubRepo } = projectData;
  const [repoPage, setRepoPage] = useState<number | null>(1);
  const [branchPage, setBranchPage] = useState<number | null>(1);

  const loadMoreRepos = async () => {
    if (!githubOwner || !repoPage) return;
    const res = await GithubService.getGithubRepositories(
      githubOwner,
      owners.find((o) => o.login === githubOwner)?.type || 'User',
      repoPage,
    );
    if (res.data) {
      setRepositories([...repositories, ...res.data.data]);
      setRepoPage(res.data.nextPage);
    } else {
      toast.error(res.error.message);
    }
  };

  const loadMoreBranches = async () => {
    if (!githubOwner || !githubRepo.name || !branchPage) return;
    const res = await GithubService.getGithubBranches(
      githubRepo.owner,
      githubRepo.name,
      branchPage,
    );
    if (res.data) {
      setBranches([...branches, ...res.data.data]);
      setBranchPage(res.data.nextPage);
    } else {
      toast.error(res.error.message);
    }
  };

  useEffect(() => {
    const fetchRepositories = async () => {
      if (!githubOwner) return;
      setIsLoading((prev) => ({ ...prev, repos: true }));
      const res = await GithubService.getGithubRepositories(
        githubOwner,
        owners.find((o) => o.login === githubOwner)?.type || 'User',
      );
      if (res.data) {
        setRepositories(res.data.data);
        setRepoPage(res.data.nextPage);
      } else {
        toast.error(res.error.message);
      }
      setIsLoading((prev) => ({ ...prev, repos: false }));
    };
    fetchRepositories();
  }, [githubOwner, owners]);

  useEffect(() => {
    const fetchBranches = async () => {
      if (!githubOwner || !githubRepo.name) return;
      setIsLoading((prev) => ({ ...prev, branches: true }));
      const res = await GithubService.getGithubBranches(githubRepo.owner, githubRepo.name);
      if (res.data) {
        setBranches(res.data.data);
        setBranchPage(res.data.nextPage);
        setProjectData((prev) => ({
          ...prev,
          githubBranch: res.data.data.find((branch) => branch.isDefault)?.name || '',
        }));
      } else {
        toast.error(res.error.message);
      }

      setIsLoading((prev) => ({ ...prev, branches: false }));
    };
    fetchBranches();
  }, [githubOwner, githubRepo, setProjectData]);

  const renderStep = () => {
    switch (localStep) {
      case 1:
        return (
          <GithubImport
            projectData={projectData}
            setProjectData={setProjectData}
            owners={owners}
            repositories={repositories}
            branches={branches}
            loading={isLoading}
            loadMoreRepos={loadMoreRepos}
            loadMoreBranches={loadMoreBranches}
            hasNextRepoPage={!!repoPage}
            hasNextBranchPage={!!branchPage}
            onBack={onBack}
            onNext={onNext}
          />
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="mb-4 text-xl font-semibold">🚀 Let&apos;s Name Your Next Big Thing</h2>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={projectData.name}
                  onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                  placeholder="Enter project name"
                  required
                />
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <Button variant="outline" className="w-full flex-1" onClick={onBack}>
                Back
              </Button>
              <Button
                className="w-full flex-1"
                disabled={!projectData.name || !projectData.category}
                onClick={onNext}
              >
                Continue
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements Description (Optional)</Label>
                <MdxEditorComponent
                  markdown={projectData.requirements}
                  onChange={(e) => setProjectData({ ...projectData, requirements: e })}
                />
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <Button variant="outline" className="w-full flex-1" onClick={onBack}>
                Back
              </Button>
              <ButtonWithLoading className="w-full flex-1" onClick={onSubmit} loading={loading}>
                Import Project
              </ButtonWithLoading>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return renderStep();
}
