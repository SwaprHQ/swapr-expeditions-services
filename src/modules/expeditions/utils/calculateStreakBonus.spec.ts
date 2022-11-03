import mongoose from 'mongoose';
import { constants } from 'ethers';
import { WeekInformation } from './week';
import { calculateStreakBonus } from './calculateStreakBonus';
import {
  IWeeklyFragment,
  WeeklyFragmentsType,
} from '../interfaces/IFragment.interface';

interface DateSettings {
  w: number;
  y: number;
}

describe('WeeklyFragmentsService', () => {
  describe('calculateStreakBonus', () => {
    it('calulates bonus properly', async () => {
      const createManyFragments = (weeksArr: DateSettings[]) =>
        weeksArr.map<IWeeklyFragment>(({ w, y }) => ({
          address: constants.AddressZero,
          campaign_id: new mongoose.Types.ObjectId(1),
          fragments: 0,
          type: WeeklyFragmentsType.LIQUIDITY_PROVISION,
          week: w,
          year: y,
        }));

      const weekInfo = ({ w, y }: DateSettings): WeekInformation => ({
        startDate: undefined as any,
        endDate: undefined as any,
        weekDate: undefined as any,
        weekNumber: w,
        year: y,
      });

      const week1 = createManyFragments([{ w: 5, y: 2000 }]);
      expect(calculateStreakBonus(week1, weekInfo({ w: 5, y: 2000 }))).toEqual(
        0
      );

      const week2 = createManyFragments([{ w: 5, y: 2000 }]);
      expect(calculateStreakBonus(week2, weekInfo({ w: 6, y: 2000 }))).toEqual(
        50
      );

      const week3 = createManyFragments([
        { w: 5, y: 2000 },
        { w: 6, y: 2000 },
        { w: 7, y: 2000 },
      ]);
      expect(calculateStreakBonus(week3, weekInfo({ w: 7, y: 2000 }))).toEqual(
        100
      );

      const week4 = createManyFragments([
        { w: 5, y: 2000 },
        { w: 6, y: 2000 },
        { w: 7, y: 2000 },
        { w: 8, y: 2000 },
      ]);
      expect(calculateStreakBonus(week4, weekInfo({ w: 8, y: 2000 }))).toEqual(
        150
      );

      const week5 = createManyFragments([
        { w: 5, y: 2000 },
        { w: 6, y: 2000 },
        { w: 7, y: 2000 },
        { w: 8, y: 2000 },
        { w: 9, y: 2000 },
      ]);
      expect(calculateStreakBonus(week5, weekInfo({ w: 9, y: 2000 }))).toEqual(
        200
      );

      const streak1a = createManyFragments([
        { w: 5, y: 2000 },
        { w: 6, y: 2000 },
        { w: 9, y: 2000 },
      ]);
      expect(
        calculateStreakBonus(streak1a, weekInfo({ w: 9, y: 2000 }))
      ).toEqual(0);

      const streak1b = createManyFragments([
        { w: 5, y: 2000 },
        { w: 8, y: 2000 },
        { w: 9, y: 2000 },
      ]);
      expect(
        calculateStreakBonus(streak1b, weekInfo({ w: 9, y: 2000 }))
      ).toEqual(50);

      const streak2 = createManyFragments([
        { w: 5, y: 2000 },
        { w: 7, y: 2000 },
        { w: 8, y: 2000 },
        { w: 9, y: 2000 },
      ]);
      expect(
        calculateStreakBonus(streak2, weekInfo({ w: 9, y: 2000 }))
      ).toEqual(100);

      const breakOfYears = createManyFragments([{ w: 52, y: 2022 }]);
      expect(
        calculateStreakBonus(breakOfYears, weekInfo({ w: 1, y: 2023 }))
      ).toEqual(50);
    });
  });
});
