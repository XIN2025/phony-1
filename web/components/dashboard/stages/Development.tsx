'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { GithubService } from '@/services';
import { useGithub } from '@/hooks/useGithub';
import { DevelopmentProps } from './development/types';
import { SuccessView } from './development/SuccessView';
import ImportRepoDialog from './development/ImportRepoDialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Code2 } from 'lucide-react';

const Development = ({ project, setProject }: DevelopmentProps) => {
  const [creatingCodespace, setCreatingCodespace] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const { githubStatus } = useGithub();
  const githubRepo = project.githubRepos?.at(0);

  const generateCodespaceURL = async () => {
    if (creatingCodespace) return;
    if (!githubStatus) {
      toast.error('Please connect your GitHub account to create a CodeSpace');
      return;
    }
    const t = toast.loading('Creating CodeSpace...');
    setCreatingCodespace(true);
    try {
      const res = await GithubService.createCodeSpaceForUser(project.id);
      if (res.data) {
        toast.success('CodeSpace created successfully', {
          id: t,
        });
        setProject((prev) => {
          const newProject = { ...prev };
          if (newProject.githubRepos && newProject.githubRepos.length > 0) {
            newProject.githubRepos[0].codespaceUrl = res.data;
          }
          return newProject;
        });
      } else {
        toast.error('Failed to create CodeSpace', { id: t });
      }
    } catch {
      toast.error('Failed to create CodeSpace', { id: t });
    } finally {
      setCreatingCodespace(false);
    }
  };

  if (!githubRepo) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-8 text-center">
        {!githubStatus ? (
          <>
            <div className="bg-card space-y-4 rounded-lg border border-dashed p-8">
              <h2 className="text-2xl font-semibold">Connect Your GitHub Account</h2>
              <p className="text-muted-foreground">
                Please connect your GitHub account to import repositories and continue development
              </p>
              <Link href="/dashboard/settings">
                <Button size="lg" className="mt-4">
                  Connect GitHub Account
                </Button>
              </Link>
              <button
                onClick={() => window.open(`vscode:extension/opengig.og-helix`)}
                className="group dark:bg-card dark:hover:bg-card/70 flex w-full items-center gap-4 rounded-lg border bg-white p-4 transition-all hover:bg-blue-50/40"
              >
                <div className="rounded-full bg-green-500/20 p-3">
                  <Code2 className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-medium">Install Helix</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get VS Code extension</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">No Repository Connected</h2>
              <p className="text-muted-foreground">
                Import a repository from GitHub to start development
              </p>
              <Button size="lg" onClick={() => setShowImportDialog(true)}>
                Import Repository
              </Button>
            </div>
            <ImportRepoDialog
              open={showImportDialog}
              onOpenChange={setShowImportDialog}
              project={project}
              setProject={setProject}
            />
            <button
              onClick={() => window.open(`vscode:extension/opengig.og-helix`)}
              className="group dark:bg-card dark:hover:bg-card/70 flex w-full max-w-xl items-center gap-4 rounded-lg border bg-white p-4 transition-all hover:bg-blue-50/40"
            >
              <div className="rounded-full bg-green-500/20 p-3">
                <Code2 className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium">Install Helix</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get VS Code extension</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-0.5" />
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <SuccessView
      githubRepo={githubRepo}
      creatingCodespace={creatingCodespace}
      generateCodespaceURL={generateCodespaceURL}
    />
  );
};

export default Development;
