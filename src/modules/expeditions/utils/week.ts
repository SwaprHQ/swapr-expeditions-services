import dayjs from 'dayjs';
import dayjsUtcPlugin from 'dayjs/plugin/utc';
import dayWeekOfYearPlugin from 'dayjs/plugin/weekOfYear';

// Extend dayjs
dayjs.extend(dayjsUtcPlugin);
dayjs.extend(dayWeekOfYearPlugin);

export interface CurrentWeekInformation {
  year: number;
  weekNumber: number;
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
}

/**
 * Get the week information for the current week in UTC
 */
export function getCurrentWeekInformation(): CurrentWeekInformation {
  // Get this week's Monday 00:00:00 UTC
  const thisWeekStart = dayjs.utc().startOf('week');
  // Get this week's Sunday 11:59:00 UTC
  const thisWeekEnd = dayjs.utc().endOf('week');

  return {
    startDate: thisWeekStart,
    endDate: thisWeekEnd,
    year: thisWeekStart.year(),
    weekNumber: thisWeekStart.week(),
  };
}

