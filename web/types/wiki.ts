export interface Wiki {
  id: string;
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content?: any;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  is_public: boolean;
  project_id: string;
  public_access_level: WikiAccessLevel;
  creator: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  children?: Wiki[];
}
export enum WikiAccessLevel {
  View = 'View',
  Comment = 'Comment',
  Edit = 'Edit',
}

export interface UpdateWikiData {
  title?: string;
  content?: string;
}

export interface UpdateWikiAccessData {
  access_level: WikiAccessLevel;
  is_public: boolean;
}
