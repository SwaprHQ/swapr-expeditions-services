import {
  addFragmentsWithMultiplier,
  AddFragmentsWithMultiplierResult,
} from './addFragmentsWithMultiplier';

describe('AddFragmentsWithMultiplier', () => {
  it('computes fragments with undefined or 0 fragments held', () => {
    expect(
      addFragmentsWithMultiplier({
        countOfCompletions: 2,
        fragmentsHeld: undefined,
        fragmentsMultiplicand: 40,
      })
    ).toStrictEqual<AddFragmentsWithMultiplierResult>({
      claimedFragments: 40 + 40 * 2,
      totalFragments: 40 + 40 * 2,
    });

    expect(
      addFragmentsWithMultiplier({
        countOfCompletions: 10,
        fragmentsHeld: 0,
        fragmentsMultiplicand: 50,
      })
    ).toStrictEqual<AddFragmentsWithMultiplierResult>({
      claimedFragments: 50 + 50 * 10,
      totalFragments: 50 + 50 * 10,
    });
  });

  it('computes fragments with undefined or 0 countOfCompletions', () => {
    expect(
      addFragmentsWithMultiplier({
        countOfCompletions: undefined,
        fragmentsHeld: 400,
        fragmentsMultiplicand: 40,
      })
    ).toStrictEqual<AddFragmentsWithMultiplierResult>({
      claimedFragments: 40,
      totalFragments: 400 + 40,
    });

    expect(
      addFragmentsWithMultiplier({
        countOfCompletions: 0,
        fragmentsHeld: 400,
        fragmentsMultiplicand: 40,
      })
    ).toStrictEqual<AddFragmentsWithMultiplierResult>({
      claimedFragments: 40,
      totalFragments: 400 + 40,
    });
  });

  it('computes fragments with all params', () => {
    expect(
      addFragmentsWithMultiplier({
        countOfCompletions: 2,
        fragmentsHeld: 320,
        fragmentsMultiplicand: 15,
      })
    ).toStrictEqual<AddFragmentsWithMultiplierResult>({
      claimedFragments: 45,
      totalFragments: 320 + 15 + 15 * 2,
    });

    expect(
      addFragmentsWithMultiplier({
        countOfCompletions: 21,
        fragmentsHeld: 1,
        fragmentsMultiplicand: 100,
      })
    ).toStrictEqual<AddFragmentsWithMultiplierResult>({
      claimedFragments: 100 + 100 * 21,
      totalFragments: 1 + 100 + 100 * 21,
    });
  });
});
