export type CreateWorklogDto = {
  projectId: string;
  hoursWorked: number;
  description?: string;
  date: string;
  bugId?: string;
  storyId?: string;
  meetingId?: string;
  wikiId?: string;
};

export type UpdateWorklogDto = {
  hoursWorked: number;
  description?: string;
  date: string;
};

export type WorklogParams = {
  projectName: string;
  date: string;
  timezone: string;
};

export type WorklogDto = {
  id: string;
  projectId: string;
  hoursWorked: number;
  description?: string;
  date: string;
  bug: {
    id: string;
    title: string;
    summary: string;
  };
  story: {
    id: string;
    title: string;
    description: string;
  };
  meeting: {
    id: string;
    title: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: any;
  };
  wiki: {
    id: string;
    title: string;
  };
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
};
