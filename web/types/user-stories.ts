export type UserStoriesDto = {
  id: string;
  projectId: string;
  sprintId: string | null;
  title: string;
  description: string;
  estimation: number;
  acceptanceCriteria: AcceptanceCriteria[];
  status: string;
  priority: number;
  dbSchemaPrompt?: string;
  apiPrompt?: string;
  uiPrompt?: string;
  assignedTo?: string;
  order?: number;
  research?: Record<string, SearchResult[]>;
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    email?: string;
  } | null;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    email?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};
type SearchResult = {
  title?: string;
  content?: string;
  url?: string;
};

type AcceptanceCriteria = {
  criteria: string;
  isCompleted?: boolean;
};

export type createStoryDto = {
  title: string;
  description: string;
  projectId: string;
  taskId: string;
  sprintId: string | null;
  estimation: number;
  priority: number;
};

export type TaskDto = {
  id: string;
  title: string;
  description: string;
  isOpen?: boolean;
  type: TaskType;
  order?: number;
  research?: {
    searchResults: SearchQueries[];
    extractedContent: ExtractedContent[];
  };
  projectId: string;
  sprintId: string | null;
  stories: UserStoriesDto[];
  createdAt: string;
  updatedAt: string;
};

export type TaskType =
  | 'Feature'
  | 'Bug'
  | 'Research'
  | 'TechnicalDebt'
  | 'Documentation'
  | 'Investigation'
  | 'Refactor'
  | 'FutureEnhancement';

type SearchQueries = {
  title: string;
  link: string;
  snippet: string;
  image?: {
    byteSize?: number;
    contextLink?: string;
    height?: number;
    thumbnailHeight?: number;
    thumbnailLink?: string;
    thumbnailWidth?: number;
    width?: number;
  };
};

type ExtractedContent = {
  url: string;
  content: string;
};

export type createTaskDto = {
  title: string;
  description: string;
  type: 'Feature' | 'Bug' | 'Research';
  projectId: string;
  sprintId: string | null;
};
export type UpdateTaskDto = {
  title?: string;
  description?: string;
  type?: TaskType;
};

export type ReorderTasksDto = {
  taskId: string;
  order: number;
}[];

export type ReorderStoriesDto = {
  storyId: string;
  order: number;
}[];
