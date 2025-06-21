// Common type for user details
export type UserDetails = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string;
};

export type Bug = {
  id: string;
  title: string;
  summary: string;
  status: BugStatusType;
  createdBy: string;
  projectId: string;
  textFeedback: string;
  voiceFeedbackUrl: string;
  voiceFeedbackTranscription: string;
  screenshots: string[];
  creator: UserDetails;
  assignee?: UserDetails;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedBugs = {
  bugs: Bug[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type TaskFromBug = {
  id: string;
  title: string;
  description: string;
  type: 'Bug';
  project_id: string;
};

export type BugStatusType = keyof typeof BugStatus;

export enum BugStatus {
  OPEN,
  FIXED,
  CLOSED,
  IN_PROGRESS,
  WORKING_AS_INTENDED,
  DEPRIOTISED,
  NEEDS_MORE_INFO,
}

export type GetBugsOptions = {
  page?: number;
  limit?: number;
  status?: BugStatusType | null;
};

export interface BugComment {
  id: string;
  content: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  bugId: string;
  parentId?: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: BugComment[];
}

export interface BugCreateCommentDto {
  bugId: string;
  content: string;
  parentId?: string;
}

export interface BugUpdateCommentDto {
  content?: string;
}

export interface UpdateBugDto {
  title?: string;
  textFeedback?: string;
}
