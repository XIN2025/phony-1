export interface WaitlistEntry {
  id: string;
  email: string;
  name?: string | null;
  from?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  updated_at: string;
}

export interface CreateWaitlistInput {
  email: string;
  name: string;
  from?: string | null;
}
