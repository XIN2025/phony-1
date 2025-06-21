export interface WikiCommentResponse {
  id: string;
  content: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  wikiId: string;
  parentId?: string;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
  replies?: WikiCommentResponse[];
}
