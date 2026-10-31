import { HetuError } from './error.js';
import type { BirthDate } from './types.js';

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

const isLeapYear = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

/** Days in a month. `month` starts at 1 and must be in 1–12. */
export const daysInMonth = (year: number, month: number): number =>
  month === 2 && isLeapYear(year) ? 29 : (DAYS_IN_MONTH[month - 1] ?? 0);

export const isRealDate = ({ year, month, day }: BirthDate): boolean =>
  Number.isInteger(year) &&
  Number.isInteger(month) &&
  Number.isInteger(day) &&
  month >= 1 &&
  month <= 12 &&
  day >= 1 &&
  day <= daysInMonth(year, month);

/** ISO-style `YYYY-MM-DD`, used for error values. */
export const formatBirthDate = ({ year, month, day }: BirthDate): string =>
  `${String(year)}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

/**
 * Returns the UTC midnight `Date` for a calendar birth date.
 * Throws {@link HetuError} when that calendar day does not exist.
 */
export const birthDateToUtcDate = (birthDate: BirthDate): Date => {
  if (!isRealDate(birthDate)) {
    throw new HetuError('date', 'Invalid birth date', formatBirthDate(birthDate));
  }

  const utc = new Date(0);
  utc.setUTCFullYear(birthDate.year, birthDate.month - 1, birthDate.day);
  return utc;
};
