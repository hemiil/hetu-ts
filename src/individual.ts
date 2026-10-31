import type { Gender } from './types.js';

type Range = { readonly min: number; readonly max: number };

const PERMANENT_INDIVIDUAL: Range = { min: 2, max: 899 };
const TEMPORARY_INDIVIDUAL: Range = { min: 900, max: 999 };

const within = (value: number, range: Range): boolean => value >= range.min && value <= range.max;

export const isTemporaryIndividual = (individualNumber: number): boolean =>
  within(individualNumber, TEMPORARY_INDIVIDUAL);

export const isAllowedIndividual = (individualNumber: number): boolean =>
  within(individualNumber, PERMANENT_INDIVIDUAL) || isTemporaryIndividual(individualNumber);

export const genderOf = (individualNumber: number): Gender =>
  individualNumber % 2 === 0 ? 'female' : 'male';

/** Moves `bound` by at most one step so that its parity matches `gender`. */
const alignedBound = (bound: number, gender: Gender, toward: 'up' | 'down'): number => {
  const wantsEven = gender === 'female';

  if ((bound % 2 === 0) === wantsEven) {
    return bound;
  }

  return toward === 'up' ? bound + 1 : bound - 1;
};

/** First number and count of the numbers of one gender, stepping by two. */
export const individualSeries = (
  gender: Gender,
  artificial: boolean
): { readonly start: number; readonly count: number } => {
  const range = artificial ? TEMPORARY_INDIVIDUAL : PERMANENT_INDIVIDUAL;
  const start = alignedBound(range.min, gender, 'up');
  const end = alignedBound(range.max, gender, 'down');

  return { start, count: (end - start) / 2 + 1 };
};
