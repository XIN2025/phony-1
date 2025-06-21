import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GlobalSearchDto {
  @ApiProperty({ description: 'Search query string' })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiProperty({
    description: 'Maximum number of results to return',
    required: false,
    default: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 5;
}

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'project' | 'story' | 'meeting' | 'bug';
  path: string;
  projectName?: string;
  metadata?: {
    status?: string;
    priority?: number;
    sprintName?: string;
    createdAt?: Date;
  };
}

export class GlobalSearchResponseDto {
  @ApiProperty({ description: 'Search results' })
  results: SearchResult[];

  @ApiProperty({ description: 'Total number of results found' })
  total: number;

  @ApiProperty({ description: 'Search query used' })
  query: string;
}
