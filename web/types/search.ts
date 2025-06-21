export interface GlobalSearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'project' | 'story' | 'meeting' | 'bug';
  path: string;
  projectName?: string;
  metadata?: {
    status?: string;
    priority?: number;
    sprintName?: string;
    createdAt?: Date;
  };
}

export interface GlobalSearchResponse {
  results: GlobalSearchResult[];
  total: number;
  query: string;
}

export interface GlobalSearchParams {
  query: string;
  limit?: number;
}
