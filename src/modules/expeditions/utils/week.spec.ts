import { getCurrentWeekInformation } from './week';

describe('getCurrentWeekInformation', () => {
  test('should return the week information for 2022-01-11', async () => {
    const currentWeek = getCurrentWeekInformation('2022-01-11');
    expect(currentWeek.weekDate).toEqual('2022-01-09');
  });
});

