import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class GetUserCreditsQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?:
    | 'credits_used'
    | 'credits_remaining'
    | 'meeting_credits_used'
    | 'meeting_credits_remaining'
    | 'created_at'
    | 'updated_at';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}
