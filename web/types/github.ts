export type GithubOwner = {
  id: string;
  login: string;
  type: 'User' | 'Organization';
  avatarUrl: string;
};

export type GithubRepository = {
  id: string;
  name: string;
  fullName: string;
  description: string | null;
  private: boolean;
  updatedAt: string;
  language: string | null;
  stargazersCount: number;
  owner: string;
};

export type GithubBranch = {
  name: string;
  isDefault: boolean;
};

export type GithubStatus = {
  username: string;
  name: string;
  email: string;
  avatar_url: string;
};

export type GithubRepo = {
  id: string;
  projectId: string;
  githubRepoUrl?: string;
  githubBranch?: string;
  codespaceUrl?: string;
  codespaceExpiry?: Date;
  isError: boolean;
  createdAt: Date;
  updatedAt: Date;
};
