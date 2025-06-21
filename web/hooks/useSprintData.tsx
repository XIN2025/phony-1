import { useState, useEffect } from 'react';
import { ProjectService } from '@/services';
import { CountryData, MonthlyTotalData, WeeklyTotalData } from '@/types/client-dashboard';

export interface SprintDataResponse {
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

export const useSprintData = () => {
  // Data states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sprintData, setSprintData] = useState<SprintDataResponse | null>(null);
  const [year, setYear] = useState<string>('default');
  // Fetch data from API
  useEffect(() => {
    const fetchSprintData = async () => {
      setLoading(true);
      try {
        setSprintData(null); // Reset sprint data before fetching
        const response = await ProjectService.getUserSprints(year);
        if (response.data) {
          setSprintData(response.data);
        } else {
          setError(response.error.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch sprint data');
      } finally {
        setLoading(false);
      }
    };

    fetchSprintData();
  }, [year]);

  return {
    loading,
    error,
    year,
    setYear,
    monthsList: sprintData?.monthsList || [],
    weeksByMonth: sprintData?.weeksByMonth || {},
    weeksList: sprintData?.weeksList || [],
    data: sprintData?.data || [],
    weeklyData: sprintData?.weeklyData || [],
    monthlyTotalData: sprintData?.monthlyTotalData || [],
    weeklyTotalData: sprintData?.weeklyTotalData || [],
    countryTotals: sprintData?.countryTotals || {},
    weeklyCountryTotals: sprintData?.weeklyCountryTotals || {},
  };
};
