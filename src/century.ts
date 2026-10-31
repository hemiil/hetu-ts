import type { CenturyMark } from './types.js';

/** Century separator and the first year of the century it denotes. */
export const CENTURY_BASE = {
  '+': 1800,
  '-': 1900,
  Y: 1900,
  X: 1900,
  W: 1900,
  V: 1900,
  U: 1900,
  A: 2000,
  B: 2000,
  C: 2000,
  D: 2000,
  E: 2000,
  F: 2000,
} as const satisfies Record<CenturyMark, number>;

export const isCenturyMark = (value: string): value is CenturyMark =>
  Object.hasOwn(CENTURY_BASE, value);

/** The inclusive year span a separator covers. */
export const centuryYearRange = (century: CenturyMark): readonly [number, number] => {
  const base = CENTURY_BASE[century];
  return [base, base + 99];
};

export const yearMatchesCentury = (year: number, century: CenturyMark): boolean => {
  const [first, last] = centuryYearRange(century);
  return year >= first && year <= last;
};

/** The conventional separator for a year, or `undefined` outside 1800–2099. */
export const defaultCentury = (year: number): CenturyMark | undefined => {
  if (year >= 1800 && year <= 1899) {
    return '+';
  }

  if (year >= 1900 && year <= 1999) {
    return '-';
  }

  if (year >= 2000 && year <= 2099) {
    return 'A';
  }

  return undefined;
};
