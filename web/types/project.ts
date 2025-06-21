import { RepositoryVisibility } from '@/components/dashboard/flows/steps/ProjectNameStep';
import { TaskDto } from './user-stories';
import { ThemeDesign } from './design';

export type ProjectAnalytics = {
  totalSprints: number;
  activeSprints: number;
  completedSprints: number;
  totalMeetings: number;
  totalTasks: number;
  totalStories: number;
  completedStories: number;
  inProgressStories: number;
  testingStories: number;
  todoStories: number;
  createdAt: string;
  updatedAt: string;
};

export type UpdateProjectDto = {
  title: string;
  clientRequirements: string;
  thirdPartyIntegrations: string[];
  logoUrl?: string;
  designTheme?: ThemeDesign;
  countryOrigin?: string;
  projectType?: string;
  projectContext?: string;
  monitoringUrls?: string[];
  docsContext?: {
    [integration: string]: string;
  };
};

export type CreateTemplateProjectDto = {
  title: string;
  template: string;
  clientRequirements: string;
  modelType: string;
  thirdPartyIntegrations: string[];
  githubUrl: string;
  ownerType: string;
  visibility?: RepositoryVisibility;
};

export type CreateProjectWithoutRepoDto = {
  title: string;
  modelType: string;
  clientRequirements: string;
};

export type Project = {
  id: string;
  title: string;
  modelType: string;
  logoUrl?: string;
  isArchived?: boolean;
  projectContext?: string;
  monitoringUrls?: string[];
  docsContext?: {
    [integration: string]: string;
  };
  countryOrigin?: string;
  projectType?: string;
  designTheme?: ThemeDesign;
  clientRequirements: string;
  thirdPartyIntegrations: string[];
  uniqueName: string;
  projectMembers?: ProjectMember[];
  sprintDuration: number;
  sprints?: Sprint[];
  githubRepos?: GithubRepo[];
  status: string;
  ownerId: string;
  owner: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type GithubRepo = {
  id: string;
  projectId: string;
  githubRepoUrl?: string;
  githubBranch?: string;
  codespaceUrl?: string;
  codespaceExpiry?: Date;
  isError?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectMember = {
  id: string;
  projectId: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  email: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
};

export type Step = {
  label: string;
  statusText: string;
};

export type ImportProjectDto = {
  title: string;
  githubUrl: string;
  modelType: string;
  githubBranch: string;
  requirements: string;
  thirdPartyIntegrations: string[];
};

export type Sprint = {
  id: string;
  projectId: string;
  name: string;
  requirements: string;
  status: string;
  startDate: Date;
  endDate: Date;
  payment: string;
  price?: number;
  feedback: string;
  userPersonas: string[];
  userStoryStatus: string;
  tasks: TaskDto[];
  project?: Project;
  sprintNumber: number;
  createdAt: Date;
  updatedAt: Date;
};
