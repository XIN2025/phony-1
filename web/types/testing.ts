type TestCase = {
  name: string;
  result: string;
};

type TestResult = {
  name: string;
  tests: number;
  passing: number;
  failing: number;
  skipped: number;
  testcases: TestCase[];
};

export type TestRun = {
  id: string;
  project_id: string;
  type: 'jest' | 'cypress';
  testResults: TestResult[];
  created_at: string;
};

export type CoverageRun = {
  id: string;
  project_id: string;
  type: 'coverage';
  testResults: FileCoverage[];
  created_at: string;
};

export type FileCoverage = {
  name: string;
  path: string;
  statements: CoverageStats;
  functions: CoverageStats;
  branches: CoverageStats;
  lines: CoverageStats;
};

export type CoverageStats = {
  covered: number;
  total: number;
  percentage: number;
};
