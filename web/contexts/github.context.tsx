import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { GithubService } from '@/services';
import { FeatureFlag, useFeatureFlag } from '@/hooks/useFeatureFlags';

type GithubStatus = {
  username: string;
  avatar_url: string;
  email: string;
  name: string;
};

interface GithubContextType {
  githubStatus: GithubStatus | null;
  isLoading: boolean;
  error: string | null;
  refreshGithubStatus: () => Promise<void>;
  clearGithubStatus: () => void;
}

export const GithubContext = createContext<GithubContextType | undefined>(undefined);

export function GithubProvider({ children }: { children: ReactNode }) {
  const [githubStatus, setGithubStatus] = useState<GithubStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEnabled = useFeatureFlag(FeatureFlag.DEVELOPMENT);

  const refreshGithubStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await GithubService.getGithubStatus();
      if (res?.data) {
        setGithubStatus(res.data);
      }
    } catch (err) {
      setError('Failed to fetch GitHub status');
      setGithubStatus(null);
    } finally {
      setIsLoading(false);
    }
  }, [setGithubStatus, setIsLoading, setError]);

  useEffect(() => {
    if (isEnabled) {
      refreshGithubStatus();
    }
  }, [isEnabled, refreshGithubStatus]);

  const clearGithubStatus = useCallback(() => {
    setGithubStatus(null);
    setError(null);
  }, []);

  return (
    <GithubContext.Provider
      value={{
        githubStatus,
        isLoading,
        error,
        refreshGithubStatus,
        clearGithubStatus,
      }}
    >
      {children}
    </GithubContext.Provider>
  );
}
