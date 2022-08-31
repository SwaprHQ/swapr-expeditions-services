import dayjs from 'dayjs';
import dayjsUtcPlugin from 'dayjs/plugin/utc';
import dayWeekOfYearPlugin from 'dayjs/plugin/weekOfYear';
import { isValidDate } from './validators';

// Extend dayjs
dayjs.extend(dayjsUtcPlugin);
dayjs.extend(dayWeekOfYearPlugin);

export interface WeekInformation {
  year: number;
  weekNumber: number;
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
  weekDate: string;
}

/**
 * Get the week information for the current week in UTC
 * @param week - The week date to get the information for. Must be in YYYY-MM-DD format.
 * @throws Error if the date is not valid
 */
export function getWeekInformation(week?: string): WeekInformation {
  // If a week is provided, validate
  if (week !== undefined && !isValidDate(week)) {
    throw new Error(`Invalid date: ${week}. Accepted format: YYYY-MM-DD`);
  }

  // Get this week's Monday 00:00:00 UTC
  const thisWeekStart = dayjs.utc(week).startOf('week');

  if (!thisWeekStart.isValid()) {
    throw new Error('Invalid week');
  }

  // Get this week's Sunday 11:59:00 UTC
  const thisWeekEnd = thisWeekStart.endOf('week');

  return {
    weekDate: thisWeekStart.format('YYYY-MM-DD'),
    startDate: thisWeekStart,
    endDate: thisWeekEnd,
    year: thisWeekStart.year(),
    weekNumber: thisWeekStart.week() - 1, // see: https://github.com/iamkun/dayjs/issues/2049
  };
}
