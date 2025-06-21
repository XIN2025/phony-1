export interface RecordingUser {
  userId: string;
  socketId: string;
  name: string;
  email: string;
  avatarUrl: string;
  startedAt: Date;
}

export interface RecordingStatus {
  projectId: string;
  user: RecordingUser;
}
