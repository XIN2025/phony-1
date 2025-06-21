'use client';

import { useEffect, useRef, useState } from 'react';
import { useSprintData } from '../../../hooks/useSprintData';
import { Sprint } from '@/types/client-dashboard';
import SprintDashboardUI from './SprintDashboardUI';
import { Loader } from 'lucide-react';

interface SprintDashboardLogicProps {
  sprints?: Sprint[];
}

const SprintDashboardLogic: React.FC<SprintDashboardLogicProps> = () => {
  // State management
  const [viewMode, setViewMode] = useState<'monthly' | 'weekly'>('monthly');
  const [displayType, setDisplayType] = useState<'table' | 'chart'>('table');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  // Ref for table scrolling
  const tableRef = useRef<HTMLDivElement>(null);

  const {
    loading,
    year,
    setYear,
    monthsList,
    weeksByMonth,
    weeksList,
    data,
    weeklyData,
    monthlyTotalData,
    weeklyTotalData,
    countryTotals,
    weeklyCountryTotals,
  } = useSprintData();

  useEffect(() => {
    if (tableRef.current) {
      const left = tableRef.current.scrollWidth;
      tableRef.current.scrollTo({ left, behavior: 'smooth' });
    }
  }, [viewMode]);

  if (loading) {
    return (
      <div className="flex h-[90%] items-center justify-center">
        <Loader className="mr-2 h-4 w-4 animate-spin" /> Loading sprint data...
      </div>
    );
  }

  if (data.length === 0 || weeklyData.length === 0) {
    return (
      <div className="flex h-[90%] flex-col items-center justify-center">
        <p className="block text-lg text-gray-500">No sprint data available.</p>
      </div>
    );
  }

  return (
    <SprintDashboardUI
      viewMode={viewMode}
      setViewMode={setViewMode}
      displayType={displayType}
      setDisplayType={setDisplayType}
      chartType={chartType}
      setChartType={setChartType}
      year={year}
      setYear={setYear}
      monthsList={monthsList}
      weeksByMonth={weeksByMonth}
      weeksList={weeksList}
      data={data}
      weeklyData={weeklyData}
      monthlyTotalData={monthlyTotalData}
      weeklyTotalData={weeklyTotalData}
      countryTotals={countryTotals}
      weeklyCountryTotals={weeklyCountryTotals}
      tableRef={tableRef}
    />
  );
};

const ClientDashboardPage = () => {
  return <SprintDashboardLogic />;
};

export default ClientDashboardPage;
