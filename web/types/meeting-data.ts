import { ProjectResource } from './project-resource';

export type MeetingCreator = {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
};

export type MeetingData = {
  id: string;
  projectId: string;
  resourceId?: string;
  createdBy: string;
  creator?: MeetingCreator;
  transcript: string;
  summary?: string;
  title?: string;
  metadata: MeetingMetadata;
  isStoriesCreated?: boolean;
  createdAt: string;
  updatedAt: string;
  resource?: ProjectResource;
};

export type LogMeetingData = {
  id: string;
  title: string;
  metadata: MeetingMetadata;
  resources: {
    resource_url: string;
    resource_name: string;
  };
};

export type MeetingMetadata = {
  startDate: string;
  endDate: string;
  durationInSeconds?: number;
};

export type UpdateMeetingData = {
  transcript?: string;
  summary?: string;
  title?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
};

export type CreateMeetingData = {
  projectId: string;
  resourceId?: string;
  transcript: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
  createdBy: string;
};
