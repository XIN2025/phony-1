// src/sprints/dto/sprint-dashboard.dto.ts
export class SprintDashboardQueryDto {
  range: 'default' | 'all' | number;
}

export class SprintData {
  [key: string]: number; // Month/Week as key, sprint count as value
}

export class ProjectData {
  name: string;
  sprints: SprintData;
}

export class CountryData {
  country: string;
  projects: ProjectData[];
}

export class WeeklyTotalData {
  name: string;
  month: string;
  weekLabel: string;
  Sprints: number;
}

export class MonthlyTotalData {
  name: string;
  Sprints: number;
}

export class SprintDashboardResponseDto {
  monthsList: string[];
  weeksByMonth: Record<string, string[]>;
  weeksList: string[];
  data: CountryData[];
  weeklyData: CountryData[];
  monthlyTotalData: MonthlyTotalData[];
  weeklyTotalData: WeeklyTotalData[];
  countryTotals: Record<string, Record<string, number>>;
  weeklyCountryTotals: Record<string, Record<string, number>>;
}
