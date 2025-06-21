// Environment Types
export interface Environment {
  id: string;
  name: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnvironmentListItem {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Request Types
export interface CreateEnvironmentDto {
  name: string;
  projectId: string;
}

export interface UpdateEnvironmentSecretsDto {
  secrets: string;
}

// Version Types
export interface SecretVersion {
  id: string;
  environmentId: string;
  versionNumber: number;
  secrets?: string;
  createdBy: string;
  createdByUser?: {
    id: string;
    email: string;
    avatar_url: string;
    first_name: string;
    last_name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SecretVersionListItem {
  id: string;
  versionNumber: number;
  createdAt: string;
  createdBy: string;
  createdByUser: {
    id: string;
    email: string;
    avatar_url: string;
    first_name: string;
    last_name: string;
  };
}
