import { Transaction } from './transaction';
import { TransactionType } from './transaction';
import { TransactionStatus } from './transaction';
import { WaitlistEntry } from './waitlist';

export enum CreditRequestStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Rejected = 'Rejected',
}

export enum ProductStage {
  Idea = 'Idea',
  MVP = 'MVP',
  InProduction = 'InProduction',
  Enterprise = 'Enterprise',
  Other = 'Other',
}

export enum UserRole {
  Founder = 'Founder',
  PM = 'PM',
  SoftwareEngineer = 'SoftwareEngineer',
  Designer = 'Designer',
  Other = 'Other',
}

export interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetTransactionsParams {
  status?: TransactionStatus;
  type?: TransactionType;
  sortBy?: 'createdAt' | 'amount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface UserCreditsResponse {
  users: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    credits_remaining: number;
    credits_used: number;
    project_count?: number;
    meeting_credits_remaining: number;
    meeting_credits_used: number;
    linkedin_profile_url?: string;
    max_projects: number;
    is_verified: boolean;
    password: boolean;
    created_at: string;
    updated_at: string;
    waitlist?: WaitlistEntry;
  }[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UsersByDateResponse {
  first_name: string;
  last_name: string;
  email: string;
  project_count: number;
  created_at: string;
  status: 'FULL_ACCESS' | 'BETA_ACCESS';
}

export interface GetUserCreditsParams {
  search?: string;
  sortBy?:
    | 'credits_used'
    | 'credits_remaining'
    | 'meeting_credits_used'
    | 'meeting_credits_remaining'
    | 'created_at'
    | 'updated_at';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface DashboardStatsResponse {
  overview: {
    totalUsers: number;
    totalCredits: number;
    totalCreditsUsed: number;
    waitlistCounts: {
      pending: number;
      approved: number;
      rejected: number;
    };
  };
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount: number;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
  created_at: string;
}

export interface CreateCouponData {
  code: string;
  description: string;
  discount: number;
  max_uses: number;
  expires_at?: string;
}

export interface UpdateCouponData {
  description?: string;
  discount?: number;
  max_uses?: number;
  expires_at?: string;
}
