export interface CommentResponse {
  id: string;
  content: string;
  formattedContent?: Record<string, any>;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  storyId: string;
  parentId?: string;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
  replies?: CommentResponse[];
}
