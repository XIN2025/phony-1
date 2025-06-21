import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { Check, X, Lock, Globe, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDebounce } from '@/hooks/useDebounce';
import { GithubService } from '@/services';
import type { GithubOwner } from '@/types/github';
import type { ProjectData } from '../../ProjectCreationFlow';
import { useGithub } from '@/hooks/useGithub';
import Link from 'next/link';
import Image from 'next/image';

export type RepositoryVisibility = 'public' | 'private' | 'internal';

type ProjectNameStepProps = {
  projectData: ProjectData & { visibility?: RepositoryVisibility };
  setProjectData: Dispatch<SetStateAction<ProjectData>>;
  onBack: () => void;
  onNext: () => void;
  owners: GithubOwner[];
};

export default function ProjectNameStep({
  projectData,
  setProjectData,
  onBack,
  onNext,
  owners,
}: ProjectNameStepProps) {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const debouncedRepoName = useDebounce(projectData.githubRepo.name, 1000);
  const [isChecking, setIsChecking] = useState(false);
  const { githubStatus } = useGithub();
  useEffect(() => {
    setProjectData((prev) => ({ ...prev, githubOwner: owners.at(0)?.login || '' }));
  }, [owners, setProjectData]);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!projectData.githubOwner || !debouncedRepoName) {
        setIsAvailable(null);
        return;
      }
      setIsChecking(true);
      const res = await GithubService.checkGithubRepositoryAvailability(
        projectData.githubOwner,
        debouncedRepoName,
      );
      if (res.data) {
        setIsAvailable(res.data);
      } else {
        toast.error(res.error?.message || 'Something went wrong');
      }
      setIsChecking(false);
    };
    checkAvailability();
  }, [debouncedRepoName, projectData.githubOwner]);

  const handleVisibilityChange = (value: RepositoryVisibility) => {
    setProjectData({ ...projectData, visibility: value });
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
            disabled={
              !projectData.githubOwner ||
              !projectData.githubRepo.name ||
              !isAvailable ||
              !projectData.name
            }
            onClick={onNext}
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">🎯 Project Details</h2>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>GitHub Owner</Label>
            <Select
              value={projectData.githubOwner}
              onValueChange={(value) => setProjectData({ ...projectData, githubOwner: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select owner" />
              </SelectTrigger>
              <SelectContent>
                {owners.map((owner) => (
                  <SelectItem key={owner.id} value={owner.login}>
                    <div className="flex items-center gap-2">
                      <Image
                        src={owner.avatarUrl}
                        alt={owner.login}
                        className="h-5 w-5 rounded-full"
                        width={20}
                        height={20}
                        unoptimized
                      />
                      <span>{owner.login}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Repository Name</Label>
            <div className="relative">
              <Input
                value={projectData.githubRepo.name}
                onChange={(e) =>
                  setProjectData({
                    ...projectData,
                    githubRepo: {
                      name: e.target.value,
                      owner: projectData.githubOwner,
                    },
                  })
                }
                placeholder="awesome-project"
                className="pr-10"
              />
              {isChecking && (
                <Loader2 className="text-muted-foreground absolute top-2.5 right-3 h-5 w-5 animate-spin" />
              )}
              {!isChecking &&
                projectData.githubRepo &&
                isAvailable !== null &&
                (isAvailable ? (
                  <Check className="absolute top-2.5 right-3 h-5 w-5 text-green-500" />
                ) : (
                  <X className="absolute top-2.5 right-3 h-5 w-5 text-red-500" />
                ))}
            </div>
            {projectData.githubRepo && isAvailable === false && (
              <p className="text-sm text-red-500/90">This repository name is already taken</p>
            )}
            {projectData.githubRepo && isAvailable === true && (
              <p className="text-sm text-green-500/90">This repository name is available</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Repository Visibility</Label>
          <div className="flex gap-2">
            <Button
              variant={projectData.visibility === 'public' ? 'default' : 'outline'}
              className="flex h-14 flex-1 items-center gap-2 p-3"
              onClick={() => handleVisibilityChange('public')}
            >
              <Globe className="h-4 w-4" />
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">Public</span>
                <span className="text-muted-foreground text-xs">
                  Anyone can see this repository
                </span>
              </div>
            </Button>
            <Button
              variant={projectData.visibility === 'private' ? 'default' : 'outline'}
              className="flex h-14 flex-1 items-center gap-2 p-3"
              onClick={() => handleVisibilityChange('private')}
            >
              <Lock className="h-4 w-4" />
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">Private</span>
                <span className="text-muted-foreground text-xs">
                  You choose who can see this repository
                </span>
              </div>
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Project Title</Label>
          <Input
            value={projectData.name || ''}
            onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
            placeholder="My Awesome Project"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" className="w-full flex-1" onClick={onBack}>
          Back
        </Button>
        <Button
          className="w-full flex-1"
          disabled={
            !projectData.githubOwner || !projectData.githubRepo || !isAvailable || !projectData.name
          }
          onClick={onNext}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
