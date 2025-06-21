import { Type } from 'class-transformer';
import {
  IsString,
  IsDate,
  IsArray,
  IsNumber,
  IsEnum,
  ValidateNested,
} from 'class-validator';
export class TestCaseDto {
  @IsString()
  name: string;

  @IsString()
  result: string;
}

export class TestResultDto {
  @IsString()
  name: string;

  @IsNumber()
  tests: number;

  @IsNumber()
  passing: number;

  @IsNumber()
  failing: number;

  @IsNumber()
  skipped: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestCaseDto)
  testcases: TestCaseDto[];
}

export class TestingDataDto {
  @IsString()
  id: string;

  @IsString()
  projectId: string;

  @IsEnum(['jest', 'cypress'])
  type: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestResultDto)
  testResults: TestResultDto[];

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}

export class CreateTestingDataDto {
  @IsEnum(['jest', 'cypress'])
  type: string;

  @IsString()
  projectName: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestResultDto)
  testResults: TestResultDto[];
}

export function mapToTestingDataDto(testingData: any): TestingDataDto {
  return {
    id: testingData.id,
    projectId: testingData.project_id,
    type: testingData.type,
    testResults: testingData.testResults,
    createdAt: testingData.created_at,
    updatedAt: testingData.updated_at,
  };
}
