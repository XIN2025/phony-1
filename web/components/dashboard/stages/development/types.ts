import { Project } from '@/types/project';

export type CodeData = {
  status: string;
  repoUrl: string;
  codeSpaceUrl: string;
  isError: boolean;
};

export type DevelopmentProps = {
  project: Project;
  setProject: React.Dispatch<React.SetStateAction<Project>>;
};

export type GenerationItem = {
  url: string;
  type: 'api' | 'page';
  status: 'generating' | 'success' | 'error';
  method?: string;
  userType?: string;
  access?: string;
  error?: string;
};
