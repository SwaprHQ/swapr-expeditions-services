import { getWeekInformation } from './week';

describe('getCurrentWeekInformation', () => {
  test('should return week starting from Monday', async () => {
    const currentWeek = getWeekInformation('2022-01-11');
    const weekDayName = Intl.DateTimeFormat('en-US', {
      weekday: 'long',
    }).format(currentWeek.startDate.toDate());
    expect(weekDayName).toEqual('Monday');
  });
  test('should return week ending with Sunday', async () => {
    const currentWeek = getWeekInformation('2022-01-11');
    const weekDayName = Intl.DateTimeFormat('en-US', {
      weekday: 'long',
    }).format(currentWeek.endDate.toDate());
    expect(weekDayName).toEqual('Sunday');
  });
  test('should return the week information for 2022-01-11', async () => {
    const currentWeek = getWeekInformation('2022-01-11');
    expect(currentWeek.weekDate).toEqual('2022-01-10');
  });

  test('should return the week number for 2022-12-31', async () => {
    const currentWeek = getWeekInformation('2022-12-31');
    expect(currentWeek.weekNumber).toEqual(52);
  });

  test('should return week information when no input is provided', async () => {
    const currentWeek = getWeekInformation();
    expect(currentWeek).toBeDefined();
  });
});
