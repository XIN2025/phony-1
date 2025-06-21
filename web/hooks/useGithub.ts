import { GithubContext } from '@/contexts/github.context';
import { useContext } from 'react';

export function useGithub() {
  const context = useContext(GithubContext);

  if (context === undefined) {
    throw new Error('useGithub must be used within a GithubProvider');
  }

  return context;
}
