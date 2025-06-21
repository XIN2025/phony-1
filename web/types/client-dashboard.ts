export interface SprintDashboardUIProps {
    viewMode: 'monthly' | 'weekly';
    setViewMode: (mode: 'monthly' | 'weekly') => void;
    displayType: 'table' | 'chart';
    setDisplayType: (type: 'table' | 'chart') => void;
    chartType: 'bar' | 'line';
    setChartType: (type: 'bar' | 'line') => void;
    year: string;
    setYear: (year: string) => void;
    monthsList: string[];
    weeksByMonth: Record<string, string[]>;
    weeksList: string[];
    data: CountryData[];
    weeklyData: CountryData[];
    monthlyTotalData: MonthlyTotalData[];
    weeklyTotalData: WeeklyTotalData[];
    countryTotals: Record<string, Record<string, number>>;
    weeklyCountryTotals: Record<string, Record<string, number>>;
    tableRef: React.RefObject<HTMLDivElement | null>;
}

export interface Sprint {
    id: string;
    projectId: string;
    status: string;
    project?: {
        id: string;
        title: string;
    };
}

export interface SprintData {
    [key: string]: number;
}

export interface ProjectData {
    name: string;
    sprints: SprintData;
}

export interface CountryData {
    country: string;
    projects: ProjectData[];
}

export interface WeeklyTotalData {
    name: string;
    month: string;
    weekLabel: string;
    Sprints: number;
}

export interface MonthlyTotalData {
    name: string;
    Sprints: number;
}