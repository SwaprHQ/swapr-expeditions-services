export interface AddFragmentsWithMultiplierParams {
  fragmentsMultiplicand: number;
  fragmentsHeld?: number;
  countOfCompletions?: number;
}

export interface AddFragmentsWithMultiplierResult {
  claimedFragments: number;
  totalFragments: number;
}

export const addFragmentsWithMultiplier = ({
  fragmentsHeld = 0,
  fragmentsMultiplicand,
  countOfCompletions = 0,
}: AddFragmentsWithMultiplierParams): AddFragmentsWithMultiplierResult => {
  const claimedFragments =
    fragmentsMultiplicand + fragmentsMultiplicand * countOfCompletions;
  const totalFragments = fragmentsHeld + claimedFragments;
  return { claimedFragments, totalFragments };
};
