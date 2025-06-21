import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TransactionStatus, TransactionType } from '@prisma/client';

export class GetTransactionsQueryDto {
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'amount';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}
