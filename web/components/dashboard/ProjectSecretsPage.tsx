'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { SecretsService } from '@/services/secrets.api';
import { EnvironmentListItem, SecretVersion, SecretVersionListItem } from '@/types/secrets';
import { Button } from '@/components/ui/button';
import { EmptyState } from './secrets/EmptyState';
import { EnvironmentSelector } from './secrets/EnvironmentSelector';
import { SecretEditor } from './secrets/SecretEditor';
import { VersionHistory } from './secrets/VersionHistory';
import { KeyRound, History } from 'lucide-react';
import { toast } from 'sonner';
import { Project } from '@/types/project';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from 'next-auth/react';

interface ProjectSecretsPageProps {
  project: Project;
}

export default function ProjectSecretsPage({ project }: ProjectSecretsPageProps) {
  const [environments, setEnvironments] = useState<EnvironmentListItem[]>([]);
  const [selectedEnv, setSelectedEnv] = useState<string>('');
  const [currentSecrets, setCurrentSecrets] = useState<SecretVersion | null>(null);
  const [versions, setVersions] = useState<SecretVersionListItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSecrets, setEditedSecrets] = useState('');
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingVersion, setIsLoadingVersion] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingEnvironment, setIsCreatingEnvironment] = useState(false);
  const { data: session } = useSession();
  const projectId = project.id;
  const isAdmin =
    project.projectMembers?.find((member) => member.userId === session?.id)?.role === 'Admin';

  const loadEnvironments = useCallback(async () => {
    setIsLoading(true);
    try {
      const envs = await SecretsService.getEnvironmentsByProject(projectId);
      if (envs.error) {
        toast.error(envs.error.message);
      } else {
        setEnvironments(envs.data);
        if (envs.data.length > 0) {
          setSelectedEnv(envs.data[0].id);
        }
      }
    } catch {
      toast.error('Failed to load environments');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const loadLatestVersion = useCallback(async () => {
    if (!selectedEnv) return;
    setIsLoadingVersion(true);
    try {
      const version = await SecretsService.getLatestVersion(selectedEnv);
      if (version.data) {
        setCurrentSecrets(version.data);
        setEditedSecrets(version.data.secrets || '');
      } else {
        toast.error(version.error.message);
      }
    } catch {
      toast.error('Failed to load latest version');
    } finally {
      setIsLoadingVersion(false);
    }
  }, [selectedEnv]);

  const loadVersions = useCallback(async () => {
    if (!selectedEnv) return;
    const res = await SecretsService.getEnvironmentVersions(selectedEnv);
    if (res.data) {
      setVersions(res.data);
    } else {
      toast.error(res.error.message);
    }
  }, [selectedEnv]);
  useEffect(() => {
    loadEnvironments();
  }, [loadEnvironments]);

  useEffect(() => {
    loadLatestVersion();
    loadVersions();
  }, [loadLatestVersion, loadVersions]);

  const handleEnvironmentChange = (value: string) => {
    setSelectedEnv(value);
    setIsEditing(false);
  };

  const handleCreateEnvironment = async (name: string) => {
    setIsCreatingEnvironment(true);
    try {
      const result = await SecretsService.createEnvironment({
        name,
        projectId,
      });
      if (result.error) {
        toast.error(result.error.message, {
          description: result.error.message,
        });
      } else {
        toast.success('Environment created successfully');
        await loadEnvironments();
      }
    } catch {
      toast.error('Failed to create environment');
    } finally {
      setIsCreatingEnvironment(false);
    }
  };

  const handleSaveSecrets = async () => {
    if (!selectedEnv) return;
    setIsSaving(true);
    try {
      const result = await SecretsService.updateEnvironmentSecrets(selectedEnv, {
        secrets: editedSecrets,
      });
      if (result.data) {
        setCurrentSecrets(result.data);
        setIsEditing(false);
        toast.success('Secrets updated successfully');
        loadVersions();
      } else {
        toast.error(result.error.message);
      }
    } catch {
      toast.error('Failed to save secrets');
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewVersion = async (versionNumber: number) => {
    if (!selectedEnv) return;
    const version = await SecretsService.getSpecificVersion(selectedEnv, versionNumber);
    if (version.data) {
      setCurrentSecrets(version.data);
    } else {
      toast.error(version.error.message);
      setShowVersionDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-10" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (environments.length === 0) {
    return (
      <EmptyState
        icon={KeyRound}
        title="No environments found"
        description="Create your first development environment to start managing secrets"
        actionLabel="Create Environment"
        onAction={() => handleCreateEnvironment('development')}
        isLoading={isCreatingEnvironment}
      />
    );
  }

  return (
    <div className="container mx-auto space-y-3 p-2 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <KeyRound className="text-primary h-5 w-5" />
            <h1 className="text-lg font-semibold">Project Secrets</h1>
          </div>
          <p className="text-muted-foreground text-sm">Manage all your project secrets</p>
        </div>
        <div className="flex items-center gap-2">
          <EnvironmentSelector
            environments={environments}
            selectedEnv={selectedEnv}
            onEnvironmentChange={handleEnvironmentChange}
            onCreateEnvironment={handleCreateEnvironment}
            isLoading={isLoading}
            isAdmin={isAdmin}
            isCreating={isCreatingEnvironment}
          />
          {currentSecrets && (
            <Button
              variant="default"
              size="sm"
              className="gap-2"
              onClick={() => setShowVersionDialog(true)}
            >
              <History className="h-4 w-4" />
              History
            </Button>
          )}
        </div>
      </div>

      {!selectedEnv ? (
        <EmptyState
          icon={KeyRound}
          title="Select an environment"
          description="Choose an environment to view and manage its secrets"
        />
      ) : (
        <SecretEditor
          currentSecrets={currentSecrets}
          isEditing={isEditing}
          editedSecrets={editedSecrets}
          onEditStart={() => setIsEditing(true)}
          onEditCancel={() => {
            setIsEditing(false);
            setEditedSecrets(currentSecrets?.secrets || '');
          }}
          onEditedSecretsChange={setEditedSecrets}
          onSaveSecrets={handleSaveSecrets}
          isLoading={isLoadingVersion}
          environment={environments.find((env) => env.id === selectedEnv)?.name || ''}
          isSaving={isSaving}
        />
      )}

      <VersionHistory
        versions={versions}
        isOpen={showVersionDialog}
        onClose={() => setShowVersionDialog(false)}
        onViewVersion={handleViewVersion}
        currentVersion={currentSecrets?.versionNumber}
      />
    </div>
  );
}
