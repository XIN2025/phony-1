import { Header } from './success/Header';
import { ReadyEnvironment } from './success/ReadyEnvironment';
import { ActionButtons } from './success/ActionButtons';
import { GithubRepo } from '@/types/project';

type Props = {
  githubRepo: GithubRepo;
  creatingCodespace: boolean;
  generateCodespaceURL: () => void;
};

export const SuccessView = ({ githubRepo, creatingCodespace, generateCodespaceURL }: Props) => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="bg-sidebar w-full max-w-3xl rounded-xl border">
        <Header repoUrl={githubRepo.githubRepoUrl ?? ''} />

        {githubRepo.codespaceUrl ? (
          <div className="flex flex-col gap-4 p-5">
            <ReadyEnvironment codeSpaceUrl={githubRepo.codespaceUrl} />
            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <div className="border-muted w-full border-t"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-sidebar text-muted-foreground px-2 text-sm">OR</span>
              </div>
            </div>
            <div className="mt-3">
              <ActionButtons repoUrl={githubRepo.githubRepoUrl ?? ''} />
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-5">
            <ActionButtons
              repoUrl={githubRepo.githubRepoUrl ?? ''}
              creatingCodespace={creatingCodespace}
              onGenerateCodespace={generateCodespaceURL}
            />
          </div>
        )}
      </div>
    </div>
  );
};
