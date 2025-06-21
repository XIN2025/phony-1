export type ResourceType =
  | 'document'
  | 'figma'
  | 'meeting'
  | 'video'
  | 'reference'
  | 'repository'
  | 'other';

export type ScheduleType = 'none' | 'daily' | 'recurring';

export type CreateProjectResourceDto = {
  projectId: string;
  resourceType: ResourceType;
  resourceURL?: string;
  resourceName: string;
  scheduleType?: ScheduleType;
  scheduleTime?: string;
  scheduleDays?: string[];
  scheduleDate?: Date;
  cronExpression?: string;
};

export type ProjectResource = {
  id: string;
  projectId: string;
  resourceType: ResourceType;
  resourceURL: string;
  resourceName: string;
  scheduleType?: ScheduleType;
  scheduleTime?: string;
  scheduleDays?: string[];
  scheduleDate?: Date;
  cronExpression?: string;
  createdAt: string;
  updatedAt: string;
};
