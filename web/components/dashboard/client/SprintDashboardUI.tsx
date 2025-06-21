import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Line,
  LineChart,
  LabelList,
  ReferenceLine,
} from 'recharts';
import {
  LayoutDashboard,
  LineChart as LineChartIcon,
  Table2,
  BarChart as BarChartIcon,
} from 'lucide-react';
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { SprintDashboardUIProps } from '@/types/client-dashboard';
import { isLastWeekOfMonth } from '@/utils/client-dashboard';

const SprintDashboardUI: React.FC<SprintDashboardUIProps> = ({
  viewMode,
  setViewMode,
  displayType,
  setDisplayType,
  chartType,
  setChartType,
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
  tableRef,
}) => {
  // Calculate the grand total of all sprints
  const calculateGrandTotal = (): number => {
    let total = 0;
    Object.values(countryTotals).forEach((country) => {
      total += country['Total'] || 0;
    });
    return total;
  };

  const calculateWeeklyGrandTotal = (): number => {
    let total = 0;
    Object.values(weeklyCountryTotals).forEach((country) => {
      total += country['Total'] || 0;
    });
    return total;
  };

  // Generate month separator positions for the weekly chart
  const getMonthSeparators = () => {
    const separators: { position: number; label: string }[] = [];
    let weekCount = 0;

    monthsList.forEach((month, monthIndex) => {
      if (monthIndex > 0) {
        weekCount += 4;
        separators.push({
          position: weekCount - 0.5,
          label: month,
        });
      }
    });

    return separators;
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-[90%] flex-col gap-3 px-2 py-3 sm:px-5 sm:py-10">
      <div className="rounded-lg sm:rounded-2xl">
        <div className="space-y-4 p-2 sm:p-0">
          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <LayoutDashboard className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
                <h1 className="text-lg font-semibold sm:text-xl">Sprints</h1>
              </div>
              <p className="text-muted-foreground text-sm sm:text-base">Manage all your Projects</p>
            </div>
            <div className="flex w-full flex-col items-start gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
              <div className="flex w-full items-center justify-between sm:w-auto">
                <Tabs
                  defaultValue={displayType}
                  onValueChange={(value) => setDisplayType(value as 'table' | 'chart')}
                  className="w-full sm:w-auto"
                >
                  <TabsList className="grid w-full grid-cols-2 sm:w-auto">
                    <TabsTrigger value="table" className="flex items-center gap-1">
                      <Table2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Table</span>
                    </TabsTrigger>
                    <TabsTrigger value="chart" className="flex items-center gap-1">
                      <LineChartIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Chart</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="flex w-full items-center justify-between sm:w-auto">
                <Tabs
                  defaultValue={viewMode}
                  onValueChange={(value) => setViewMode(value as 'monthly' | 'weekly')}
                  className="w-full sm:w-auto"
                >
                  <TabsList className="grid w-full grid-cols-2 sm:w-auto">
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {displayType === 'chart' && (
                <div className="flex w-full items-center justify-between sm:w-auto">
                  <Tabs
                    defaultValue={chartType}
                    onValueChange={(value) => setChartType(value as 'bar' | 'line')}
                    className="w-full sm:w-auto"
                  >
                    <TabsList className="grid w-full grid-cols-2 sm:w-auto">
                      <TabsTrigger value="bar" className="flex items-center gap-1">
                        <BarChartIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Bar</span>
                      </TabsTrigger>
                      <TabsTrigger value="line" className="flex items-center gap-1">
                        <LineChartIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Line</span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              )}

              <div className="w-full sm:w-auto">
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select Year Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {displayType === 'table' ? (
            <div className="relative w-full flex-1 overflow-hidden rounded-lg border shadow-xs sm:rounded-2xl">
              <div
                ref={tableRef}
                className="inset-0 flex flex-col overflow-hidden"
                style={{
                  maxHeight: '80vh',
                  overflowY: 'auto',
                }}
              >
                <Table>
                  {viewMode === 'monthly' ? (
                    /* Monthly View */
                    <>
                      <TableHeader className="bg-background sticky top-0 z-10">
                        <TableRow>
                          <TableHead className="bg-background sticky top-0 left-0 z-50 min-w-[80px] text-center sm:min-w-[100px]">
                            Country
                          </TableHead>
                          <TableHead className="bg-background sticky top-0 left-[80px] z-50 min-w-[120px] sm:left-[100px] sm:min-w-[150px]">
                            Project
                          </TableHead>
                          {monthsList.map((month) => (
                            <TableHead
                              id={month}
                              key={month}
                              className="min-w-[50px] text-center sm:min-w-[60px]"
                            >
                              {month}
                            </TableHead>
                          ))}
                          <TableHead className="min-w-[70px] text-center sm:min-w-[80px]">
                            Total
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.map((group, countryIndex) => (
                          <>
                            {group.projects.map((project, projectIndex) => {
                              const totalSprints = monthsList.reduce(
                                (sum, month) => sum + (project.sprints[month] || 0),
                                0,
                              );

                              return (
                                <TableRow key={`${countryIndex}-${projectIndex}`}>
                                  {projectIndex === 0 && (
                                    <TableCell
                                      rowSpan={group.projects.length}
                                      className="bg-background sticky left-0 z-0 text-center align-middle text-xs font-medium sm:text-sm"
                                    >
                                      {group.country}
                                    </TableCell>
                                  )}
                                  <TableCell className="bg-background sticky left-[80px] z-0 text-xs sm:left-[100px] sm:text-sm">
                                    {project.name}
                                  </TableCell>
                                  {monthsList.map((month) => (
                                    <TableCell
                                      key={month}
                                      className="p-1 text-center text-xs sm:p-2 sm:text-sm"
                                    >
                                      {project.sprints[month] || 0}
                                    </TableCell>
                                  ))}
                                  <TableCell className="text-center text-xs font-semibold sm:text-sm">
                                    {totalSprints}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableHead className="bg-secondary text-secondary-foreground sticky left-0 z-0 text-center font-bold sm:min-w-[100px]"></TableHead>
                          <TableHead className="bg-secondary text-secondary-foreground sticky left-[80px] z-0 font-bold sm:left-[100px] sm:min-w-[150px]">
                            Total
                          </TableHead>
                          {monthsList.map((month) => {
                            // Calculate total sprints for this month across all countries
                            let monthTotal = 0;
                            Object.values(countryTotals).forEach((country) => {
                              monthTotal += country[month] || 0;
                            });

                            return (
                              <TableHead
                                id={month}
                                key={month}
                                className="bg-secondary text-secondary-foreground min-w-[70px] text-center font-bold sm:min-w-[80px]"
                              >
                                {monthTotal}
                              </TableHead>
                            );
                          })}
                          <TableHead className="bg-secondary text-secondary-foreground min-w-[70px] text-center font-bold sm:min-w-[80px]">
                            {calculateGrandTotal()}
                          </TableHead>
                        </TableRow>

                        {/* Country totals moved to the bottom after grand total */}
                        {data.map((group, countryIndex) => (
                          <TableRow key={`country-total-${countryIndex}`}>
                            <TableHead className="bg-background sticky left-0 z-0 text-center text-xs font-medium sm:text-sm"></TableHead>
                            <TableHead className="bg-background sticky left-[80px] z-0 text-xs font-bold sm:left-[100px] sm:text-sm">
                              {group.country} Total
                            </TableHead>
                            {monthsList.map((month) => (
                              <TableHead
                                key={`total-${month}`}
                                className="bg-background p-1 text-center text-xs font-medium sm:p-2 sm:text-sm"
                              >
                                {countryTotals[group.country][month] || 0}
                              </TableHead>
                            ))}
                            <TableHead className="bg-background text-center text-xs font-medium sm:text-sm">
                              {countryTotals[group.country]['Total'] || 0}
                            </TableHead>
                          </TableRow>
                        ))}
                      </TableFooter>
                    </>
                  ) : (
                    /* Weekly View with Month Headers and Separators */
                    <>
                      <TableHeader className="bg-background sticky top-0 z-10">
                        {/* First row: Month headers spanning their weeks */}
                        <TableRow>
                          <TableHead
                            className="bg-background sticky left-0 z-20 min-w-[80px] text-center sm:min-w-[100px]"
                            rowSpan={2}
                          >
                            Country
                          </TableHead>
                          <TableHead
                            className="bg-background sticky left-[80px] z-20 min-w-[120px] sm:left-[100px] sm:min-w-[150px]"
                            rowSpan={2}
                          >
                            Project
                          </TableHead>
                          {monthsList.map((month) => (
                            <TableHead
                              key={`header-${month}`}
                              id={month}
                              className="border-b p-1 text-center text-xs sm:p-2 sm:text-sm"
                              colSpan={4} // Each month spans 4 weeks
                            >
                              {month}
                            </TableHead>
                          ))}
                          <TableHead
                            className="min-w-[70px] text-center sm:min-w-[80px]"
                            rowSpan={2}
                          >
                            Total
                          </TableHead>
                        </TableRow>

                        {/* Second row: Individual week headers */}
                        <TableRow>
                          {monthsList.map((month) =>
                            weeksByMonth[month].map((week, weekIndex) => {
                              const isLastWeek = isLastWeekOfMonth(weekIndex);
                              return (
                                <TableHead
                                  key={`week-${month}-${week}`}
                                  className={`min-w-[50px] py-1 text-center text-xs sm:min-w-[60px] sm:py-2 sm:text-sm ${isLastWeek ? 'border-muted border-r-2' : ''}`}
                                >
                                  {week}
                                </TableHead>
                              );
                            }),
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {weeklyData.map((group, countryIndex) => (
                          <>
                            {group.projects.map((project, projectIndex) => {
                              const totalSprints = weeksList.reduce(
                                (sum, week) => sum + (project.sprints[week] || 0),
                                0,
                              );

                              return (
                                <TableRow key={`weekly-${countryIndex}-${projectIndex}`}>
                                  {projectIndex === 0 && (
                                    <TableCell
                                      rowSpan={group.projects.length}
                                      className="bg-background sticky left-0 z-0 text-center align-middle text-xs font-medium sm:text-sm"
                                    >
                                      {group.country}
                                    </TableCell>
                                  )}
                                  <TableCell className="bg-background sticky left-[80px] z-0 text-xs sm:left-[100px] sm:text-sm">
                                    {project.name}
                                  </TableCell>
                                  {weeksList.map((week, weekIndex) => {
                                    // Check if this is the last week of a month to add separator
                                    const isLastWeek = (weekIndex + 1) % 4 === 0;

                                    return (
                                      <TableCell
                                        key={week}
                                        className={`p-1 text-center text-xs sm:p-2 sm:text-sm ${isLastWeek ? 'border-muted border-r-2' : ''}`}
                                      >
                                        {project.sprints[week] || 0}
                                      </TableCell>
                                    );
                                  })}
                                  <TableCell className="text-center text-xs font-semibold sm:text-sm">
                                    {totalSprints}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableHead className="bg-secondary text-secondary-foreground sticky left-0 z-0 text-center font-bold sm:min-w-[100px]"></TableHead>
                          <TableHead className="bg-secondary text-secondary-foreground sticky left-[80px] z-0 font-bold sm:left-[100px] sm:min-w-[150px]">
                            Total
                          </TableHead>
                          {weeksList.map((week, weekIndex) => {
                            // Calculate total sprints for this week across all countries
                            let weekTotal = 0;
                            Object.values(weeklyCountryTotals).forEach((country) => {
                              weekTotal += country[week] || 0;
                            });

                            // Check if this is the last week of a month to add separator
                            const isLastWeek = (weekIndex + 1) % 4 === 0;

                            return (
                              <TableHead
                                key={`total-all-${week}`}
                                className={`bg-secondary text-secondary-foreground min-w-[50px] py-1 text-center text-xs font-bold sm:min-w-[60px] sm:py-2 sm:text-sm ${isLastWeek ? 'border-muted border-r-2' : ''}`}
                              >
                                {weekTotal}
                              </TableHead>
                            );
                          })}
                          <TableHead className="bg-secondary text-secondary-foreground min-w-[70px] text-center font-bold sm:min-w-[80px]">
                            {calculateWeeklyGrandTotal()}
                          </TableHead>
                        </TableRow>

                        {/* Weekly country totals moved to bottom after grand total */}
                        {weeklyData.map((group, countryIndex) => (
                          <TableRow
                            key={`weekly-country-total-${countryIndex}`}
                            className="bg-slate-50"
                          >
                            <TableHead className="bg-background sticky left-0 z-0 text-center text-xs font-medium sm:text-sm"></TableHead>
                            <TableHead className="bg-background sticky left-[80px] z-0 text-xs font-bold sm:left-[100px] sm:text-sm">
                              {group.country} Total
                            </TableHead>
                            {weeksList.map((week, weekIndex) => {
                              // Check if this is the last week of a month to add separator
                              const isLastWeek = (weekIndex + 1) % 4 === 0;

                              return (
                                <TableHead
                                  key={`total-${week}`}
                                  className={`bg-background p-1 text-center text-xs font-medium sm:p-2 sm:text-sm ${isLastWeek ? 'border-muted border-r-2' : ''}`}
                                >
                                  {weeklyCountryTotals[group.country][week] || 0}
                                </TableHead>
                              );
                            })}
                            <TableHead className="bg-background text-center text-xs font-medium sm:text-sm">
                              {weeklyCountryTotals[group.country]['Total'] || 0}
                            </TableHead>
                          </TableRow>
                        ))}
                      </TableFooter>
                    </>
                  )}
                </Table>
              </div>
            </div>
          ) : (
            /* Chart View - Shows both monthly and weekly charts side by side */
            <div className="grid grid-cols-1 gap-4">
              <Card className="p-2 sm:p-3">
                <CardContent className="pt-4">
                  <h3 className="text-md mb-3 text-center font-medium">
                    {viewMode === 'monthly' ? 'Monthly Active Sprints' : 'Weekly Active Sprints'}
                  </h3>

                  <ResponsiveContainer width="100%" height={350}>
                    {chartType === 'bar' ? (
                      <BarChart
                        data={viewMode === 'monthly' ? monthlyTotalData : weeklyTotalData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 5,
                          bottom: viewMode === 'weekly' ? 0 : 40,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          angle={viewMode === 'weekly' ? -45 : 0}
                          textAnchor={viewMode === 'weekly' ? 'end' : 'middle'}
                          height={viewMode === 'weekly' ? 100 : 30}
                          tick={{ fontSize: 12 }}
                          interval={0}
                        />
                        <YAxis
                          label={{
                            value: 'Sprints',
                            angle: -90,
                            position: 'insideLeft',
                            style: { textAnchor: 'middle' },
                          }}
                          allowDecimals={false}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                          labelStyle={{
                            color: 'GrayText',
                            fontWeight: 'bold',
                          }}
                          itemStyle={{
                            color: 'GrayText',
                          }}
                        />
                        <Bar dataKey="Sprints" fill="#8884d8">
                          <LabelList dataKey="Sprints" position="top" fontSize={12} />
                        </Bar>

                        {/* Add month separators in weekly view */}
                        {viewMode === 'weekly' &&
                          getMonthSeparators().map((separator, index) => (
                            <ReferenceLine
                              key={`separator-${index}`}
                              x={separator.position}
                              stroke="#666"
                              strokeDasharray="3 3"
                              label={{
                                value: separator.label,
                                position: 'center',
                                fill: '#000',
                                fontSize: 11,
                              }}
                            />
                          ))}
                      </BarChart>
                    ) : (
                      <LineChart
                        data={viewMode === 'monthly' ? monthlyTotalData : weeklyTotalData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 5,
                          bottom: viewMode === 'weekly' ? 0 : 40,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          angle={viewMode === 'weekly' ? -45 : 0}
                          textAnchor={viewMode === 'weekly' ? 'end' : 'middle'}
                          height={viewMode === 'weekly' ? 100 : 30}
                          tick={{ fontSize: 12 }}
                          interval={0}
                        />
                        <YAxis
                          label={{
                            value: 'Sprints',
                            angle: -90,
                            position: 'insideLeft',
                            style: { textAnchor: 'middle' },
                          }}
                          allowDecimals={false}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                          labelStyle={{
                            color: 'GrayText',
                            fontWeight: 'bold',
                          }}
                          itemStyle={{
                            color: 'GrayText',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="Sprints"
                          stroke="#8884d8"
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                        >
                          <LabelList dataKey="Sprints" position="top" />
                        </Line>

                        {/* Add month separators in weekly view */}
                        {viewMode === 'weekly' &&
                          getMonthSeparators().map((separator, index) => (
                            <ReferenceLine
                              key={`separator-${index}`}
                              x={separator.position}
                              stroke="#666"
                              strokeDasharray="3 3"
                              label={{
                                value: separator.label,
                                position: 'insideTopRight',
                                fill: '#666',
                                fontSize: 11,
                              }}
                            />
                          ))}
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SprintDashboardUI;
