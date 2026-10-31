import { describe, expect, it } from 'vitest';
import { daysInMonth, formatBirthDate, isRealDate } from '../src/calendar.js';
import { HetuError, birthDateToUtcDate } from '../src/index.js';

describe('calendar', () => {
  it.each([
    [1900, 28],
    [2000, 29],
    [2023, 28],
    [2024, 29],
    [2100, 28],
  ])('has the right February length in %i', (year, days) => {
    expect(daysInMonth(year, 2)).toBe(days);
    expect(isRealDate({ year, month: 2, day: days })).toBe(true);
    expect(isRealDate({ year, month: 2, day: days + 1 })).toBe(false);
  });

  it.each([
    { year: 1990, month: 0, day: 1 },
    { year: 1990, month: 13, day: 1 },
    { year: 1990, month: 4, day: 31 },
    { year: 1990, month: 1, day: 0 },
    { year: 1990, month: 1.5, day: 1 },
    { year: Number.NaN, month: 1, day: 1 },
  ])('rejects %o', (birthDate) => {
    expect(isRealDate(birthDate)).toBe(false);
  });

  it('converts years below 100 without the Date.UTC century shift', () => {
    expect(birthDateToUtcDate({ year: 50, month: 3, day: 4 }).getUTCFullYear()).toBe(50);
  });

  it('formats and rejects impossible dates', () => {
    expect(formatBirthDate({ year: 1990, month: 1, day: 5 })).toBe('1990-01-05');
    expect(() => birthDateToUtcDate({ year: 1990, month: 2, day: 30 })).toThrow(HetuError);
  });
});
