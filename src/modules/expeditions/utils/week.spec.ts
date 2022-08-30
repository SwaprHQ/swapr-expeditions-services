import { getWeekInformation } from './week';

describe('getCurrentWeekInformation', () => {
  test('should return the week information for 2022-01-11', async () => {
    const currentWeek = getWeekInformation('2022-01-11');
    expect(currentWeek.weekDate).toEqual('2022-01-09');
  });
});

