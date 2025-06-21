import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export interface TestCaseDto {
  name: string;
  result: string;
}

export interface TestResultDto {
  name: string;
  tests: number;
  passing: number;
  failing: number;
  skipped: number;
  testcases: TestCaseDto[];
}

export class TestingDataDto {
  @IsString()
  @IsNotEmpty()
  type: 'jest' | 'cypress';

  @IsString()
  @IsNotEmpty()
  projectName: string;

  @IsArray()
  @IsNotEmpty()
  testResults: TestResultDto[];
}

export class CoverageDataDto {
  @IsString()
  @IsNotEmpty()
  projectName: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
