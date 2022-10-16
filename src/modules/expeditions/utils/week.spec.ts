import { getWeekInformation } from './week';

describe('getCurrentWeekInformation', () => {
  test('should return the week information for 2022-01-11', async () => {
    const currentWeek = getWeekInformation('2022-01-11');
    expect(currentWeek.weekDate).toEqual('2022-01-09');
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
