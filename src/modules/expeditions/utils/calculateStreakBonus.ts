import { WeekInformation } from './week';
import { PAST_WEEK_ADDITIONAL_FRAGMENT } from '../../config/config.service';
import { IWeeklyFragment } from '../interfaces/IFragment.interface';

export const calculateStreakBonus = (
  weeklyFragments: IWeeklyFragment[],
  currentWeek: WeekInformation
) => {
  const weeks = weeklyFragments.map(({ week, year }) => ({ week, year }));

  if (
    !weeks.find(
      ({ week, year }) =>
        year === currentWeek.year && week === currentWeek.weekNumber
    )
  ) {
    weeks.push({
      week: currentWeek.weekNumber,
      year: currentWeek.year,
    });
  }

  const sortedWeeks = weeks.sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;

    return b.week - a.week;
  });

  const streakBonus = PAST_WEEK_ADDITIONAL_FRAGMENT;

  let bonus = 0;

  for (let i = 0; i < sortedWeeks.length; i++) {
    const diff = sortedWeeks[i].week - sortedWeeks[i + 1]?.week;
    // first week of new year - last week of previous year = -51
    if (![1, -51].includes(diff)) break;
    bonus += streakBonus;
  }

  return bonus;
};
