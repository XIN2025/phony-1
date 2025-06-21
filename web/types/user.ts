export type UserDto = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  credits_used: number;
  credits_remaining: number;
  meeting_credits_used: number;
  meeting_credits_remaining: number;
  linkedin_profile_url?: string;
  is_verified: boolean;
  created_at: Date;
};

export type UserUpdateDto = {
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  linkedin_profile_url?: string;
};

enum UserRole {
  Founder = 'Founder',
  PM = 'PM',
  SoftwareEngineer = 'SoftwareEngineer',
  Designer = 'Designer',
  Other = 'Other',
}

enum ProductStage {
  Idea = 'Idea',
  MVP = 'MVP',
  InProduction = 'InProduction',
  Enterprise = 'Enterprise',
  Other = 'Other',
}

export type CreditRequestDto = {
  linkedin_url?: string;
  role: UserRole;
  product_stage: ProductStage;
  credits_amount: number;
};
