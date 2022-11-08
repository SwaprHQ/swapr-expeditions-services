import dayjs from 'dayjs';
import dayjsUtcPlugin from 'dayjs/plugin/utc';
import dayWeekOfYearPlugin from 'dayjs/plugin/weekOfYear';
import isoWeekPlugin from 'dayjs/plugin/isoWeek';

dayjs.extend(dayjsUtcPlugin);
dayjs.extend(dayWeekOfYearPlugin);
dayjs.extend(isoWeekPlugin);

export { dayjs };
