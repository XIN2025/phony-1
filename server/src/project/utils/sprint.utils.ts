import {
  addMonths,
  endOfMonth,
  endOfYear,
  format,
  startOfMonth,
  startOfYear,
  subMonths,
} from 'date-fns';
import {
  CountryData,
  MonthlyTotalData,
  SprintDashboardQueryDto,
} from '../dtos/sprint-dashboard.dto';

export function processSprintDataWithExpandedWeeks(
  sprintsData: { sprints: any[]; startDate: Date; endDate: Date },
  monthsList: string[],
  expandedWeeksList: string[],
) {
  const { sprints } = sprintsData;

  // Initialize structures for data collection
  const countryData: CountryData[] = [];
  const weeklyCountryData: CountryData[] = [];

  // Track unique projects and countries
  const countries = new Set<string>();
  const projectsByCountry = new Map<string, Set<string>>();

  // First pass: collect all unique countries and projects
  sprints.forEach((sprint) => {
    const country = sprint.projects?.country_origin || 'Unknown';
    const projectName = sprint.projects.title;

    countries.add(country);

    if (!projectsByCountry.has(country)) {
      projectsByCountry.set(country, new Set());
    }
    projectsByCountry.get(country).add(projectName);
  });

  // Second pass: build the data structure with all countries and projects
  countries.forEach((country) => {
    const countryEntry: CountryData = { country, projects: [] };
    const weeklyCountryEntry: CountryData = { country, projects: [] };

    projectsByCountry.get(country).forEach((projectName) => {
      // Initialize monthly data for this project
      const projectEntry = { name: projectName, sprints: {} };
      monthsList.forEach((month) => {
        projectEntry.sprints[month] = 0;
      });

      // Initialize weekly data for this project with expanded weeks
      const weeklyProjectEntry = { name: projectName, sprints: {} };
      expandedWeeksList.forEach((expandedWeek) => {
        weeklyProjectEntry.sprints[expandedWeek] = 0;
      });

      // Track processed sprints to avoid double counting
      const processedSprintsMonthly = new Map<string, Set<string>>();
      monthsList.forEach((month) => {
        processedSprintsMonthly.set(month, new Set<string>());
      });

      const processedSprintsWeekly = new Map<string, Set<string>>();
      expandedWeeksList.forEach((expandedWeek) => {
        processedSprintsWeekly.set(expandedWeek, new Set<string>());
      });

      // Create map to track sprint start and end weeks for this project
      const projectSprintsByWeek = new Map<
        string,
        { starting: Set<string>; ending: Set<string> }
      >();
      expandedWeeksList.forEach((expandedWeek) => {
        projectSprintsByWeek.set(expandedWeek, {
          starting: new Set<string>(),
          ending: new Set<string>(),
        });
      });

      // First identify all sprint starts and ends by week
      sprints.forEach((sprint) => {
        const projectCountry = sprint.projects?.country_origin || 'Unknown';
        if (
          projectCountry === country &&
          sprint.projects.title === projectName
        ) {
          const sprintId = sprint.id;
          const sprintStartDate = new Date(sprint.start_date);
          const sprintEndDate = new Date(sprint.end_date);

          // Find the week when the sprint starts
          const startWeek = getExpandedWeekForDate(sprintStartDate, monthsList);
          if (startWeek && expandedWeeksList.includes(startWeek)) {
            projectSprintsByWeek.get(startWeek).starting.add(sprintId);
          }

          // Find the week when the sprint ends
          const endWeek = getExpandedWeekForDate(sprintEndDate, monthsList);
          if (endWeek && expandedWeeksList.includes(endWeek)) {
            projectSprintsByWeek.get(endWeek).ending.add(sprintId);
          }
        }
      });

      // Process each sprint
      sprints.forEach((sprint) => {
        const projectCountry = sprint.projects?.country_origin || 'Unknown';
        if (
          projectCountry === country &&
          sprint.projects.title === projectName
        ) {
          const sprintStartDate = new Date(sprint.start_date);
          const sprintEndDate = new Date(sprint.end_date);
          const sprintId = sprint.id;

          // For monthly data
          monthsList.forEach((month) => {
            const [monthName, yearStr] = month.split(' ');
            const year = parseInt(yearStr);
            const monthIndex = getMonthIndex(monthName);

            const monthStart = new Date(year, monthIndex, 1);
            const monthEnd = new Date(year, monthIndex + 1, 0); // Last day of month

            // If sprint overlaps with this month and hasn't been counted yet
            if (
              !(sprintEndDate < monthStart || sprintStartDate > monthEnd) &&
              !processedSprintsMonthly.get(month).has(sprintId)
            ) {
              processedSprintsMonthly.get(month).add(sprintId);
              projectEntry.sprints[month]++;
            }
          });

          // For weekly data across all months
          const currentDate = new Date(sprintStartDate);
          while (currentDate <= sprintEndDate) {
            const expandedWeekName = getExpandedWeekForDate(
              currentDate,
              monthsList,
            );

            // Only process if this expanded week is in our list
            if (
              expandedWeekName &&
              expandedWeeksList.includes(expandedWeekName)
            ) {
              // If we haven't counted this sprint for this expanded week yet
              if (!processedSprintsWeekly.get(expandedWeekName).has(sprintId)) {
                // Check if this is the ending week for this sprint
                const isEndingWeek =
                  getExpandedWeekForDate(sprintEndDate, monthsList) ===
                  expandedWeekName;

                // Skip counting if this is the ending week AND there's another sprint starting this week
                const shouldSkip =
                  isEndingWeek &&
                  projectSprintsByWeek.get(expandedWeekName).starting.size >
                    0 &&
                  !projectSprintsByWeek
                    .get(expandedWeekName)
                    .starting.has(sprintId);

                if (!shouldSkip) {
                  processedSprintsWeekly.get(expandedWeekName).add(sprintId);
                  weeklyProjectEntry.sprints[expandedWeekName]++;
                }
              }
            }

            // Move to the next day
            currentDate.setDate(currentDate.getDate() + 1);
          }
        }
      });

      countryEntry.projects.push(projectEntry);
      weeklyCountryEntry.projects.push(weeklyProjectEntry);
    });

    countryData.push(countryEntry);
    weeklyCountryData.push(weeklyCountryEntry);
  });

  countryData.sort((a, b) => {
    if (a.country === 'Unknown') return 1;
    if (b.country === 'Unknown') return -1;
    return a.country.localeCompare(b.country);
  });

  weeklyCountryData.sort((a, b) => {
    if (a.country === 'Unknown') return 1;
    if (b.country === 'Unknown') return -1;
    return a.country.localeCompare(b.country);
  });

  return { countryData, weeklyCountryData };
}

function getExpandedWeekForDate(
  date: Date,
  monthsList: string[],
): string | null {
  const currentYear = date.getFullYear();
  const currentMonthIndex = date.getMonth();
  const monthName = getMonthName(currentMonthIndex);
  const monthStr = `${monthName} ${currentYear}`;

  // Only process if this month is in our months list
  if (monthsList.includes(monthStr)) {
    const weekNumber = getWeekNumberInMonth(date);
    const weekName = `Week ${weekNumber}`;
    return `${monthStr} ${weekName}`;
  }

  return null;
}

export function getMonthName(monthIndex: number): string {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return months[monthIndex];
}
export function calculateExpandedWeeklyTotalData(
  expandedWeeksList: string[],
  weeklyData: CountryData[],
): any[] {
  return expandedWeeksList.map((expandedWeek) => {
    let total = 0;
    weeklyData.forEach((country) => {
      country.projects.forEach((project) => {
        total += project.sprints[expandedWeek] || 0;
      });
    });

    // Parse the expanded week to extract components
    const [month, year, , weekNum] = expandedWeek.split(' ');

    return {
      name: expandedWeek,
      month: `${month} ${year}`,
      weekLabel: weekNum,
      Sprints: total,
    };
  });
}

// Calculate country totals by expanded week
export function calculateExpandedWeeklyCountryTotals(
  data: CountryData[],
  expandedWeeksList: string[],
): Record<string, Record<string, number>> {
  const countryTotals: Record<string, Record<string, number>> = {};

  data.forEach((country) => {
    countryTotals[country.country] = {};
    expandedWeeksList.forEach((expandedWeek) => {
      let total = 0;
      country.projects.forEach((project) => {
        total += project.sprints[expandedWeek] || 0;
      });
      countryTotals[country.country][expandedWeek] = total;
    });

    // Calculate grand total
    let grandTotal = 0;
    expandedWeeksList.forEach((expandedWeek) => {
      grandTotal += countryTotals[country.country][expandedWeek];
    });
    countryTotals[country.country]['Total'] = grandTotal;
  });

  return countryTotals;
}

export function getMonthIndex(monthName: string): number {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return months.indexOf(monthName);
}
// Week number calculation - kept as is since you specified this is your requirement
export function getWeekNumberInMonth(date: Date): number {
  const day = date.getDate();

  if (day <= 7) return 1;
  if (day <= 14) return 2;
  if (day <= 21) return 3;
  return 4; // days 22-31
}

// Calculate monthly totals
export function calculateTotalMonthlyData(
  monthsList: string[],
  data: CountryData[],
): MonthlyTotalData[] {
  return monthsList.map((month) => {
    let total = 0;
    data.forEach((country) => {
      country.projects.forEach((project) => {
        total += project.sprints[month] || 0;
      });
    });
    return { name: month, Sprints: total };
  });
}

// Calculate country totals by month
export function calculateCountryTotals(
  data: CountryData[],
  months: string[],
): Record<string, Record<string, number>> {
  const countryTotals: Record<string, Record<string, number>> = {};

  data.forEach((country) => {
    countryTotals[country.country] = {};
    months.forEach((month) => {
      let total = 0;
      country.projects.forEach((project) => {
        total += project.sprints[month] || 0;
      });
      countryTotals[country.country][month] = total;
    });

    // Calculate grand total
    let grandTotal = 0;
    months.forEach((month) => {
      grandTotal += countryTotals[country.country][month];
    });
    countryTotals[country.country]['Total'] = grandTotal;
  });

  return countryTotals;
}

// Generate simple week labels without month names
export function generateAllWeeks(): string[] {
  return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
}

// Each month gets exactly 4 weeks
export function generateWeeksByMonth(
  monthsList: string[],
): Record<string, string[]> {
  const weeksByMonth: Record<string, string[]> = {};

  monthsList.forEach((month) => {
    weeksByMonth[month] = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  });

  return weeksByMonth;
}

// Month range method
export function getMonthsRange(startDate: Date, endDate: Date): string[] {
  const months = [];
  let currentDate = startOfMonth(startDate);

  while (currentDate <= endDate) {
    const monthName = format(currentDate, 'MMM yyyy');
    months.push(monthName);
    currentDate = addMonths(currentDate, 1);
  }
  return months;
}

export function getDateRange(query: SprintDashboardQueryDto): {
  startDate: Date;
  endDate: Date;
} {
  const now = new Date();
  if (
    typeof query.range === 'number' &&
    query.range >= 1900 &&
    query.range <= 2100
  ) {
    const year = query.range;
    const startDate = startOfYear(new Date(year, 0, 1));
    const endDate =
      year === now.getFullYear()
        ? endOfMonth(now)
        : endOfYear(new Date(year, 0, 1));
    return { startDate, endDate };
  } else {
    const startDate = startOfMonth(subMonths(now, 11));
    const endDate = endOfMonth(now);
    return { startDate, endDate };
  }
}
