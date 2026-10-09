import { HetuError } from './error.js';

export const HETU_ALPHABET = '0123456789ABCDEFHJKLMNPRSTUVWXY';

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
} as const;

export type CenturyMark = keyof typeof CENTURY_BASE;

export type Gender = 'male' | 'female';

export const PERMANENT_INDIVIDUAL = { min: 2, max: 899 } as const;
export const TEMPORARY_INDIVIDUAL = { min: 900, max: 999 } as const;

export type HetuParts = {
  readonly day: number;
  readonly month: number;
  readonly year: number;
  readonly century: CenturyMark;
  readonly individualNumber: number;
  readonly isTemporary: boolean;
  readonly gender: Gender;
};

export type HetuReadFailure = 'format' | 'date' | 'individual' | 'checksum';

export type HetuReadResult =
  | { readonly ok: true; readonly parts: HetuParts }
  | { readonly ok: false; readonly reason: HetuReadFailure };

export const isCenturyMark = (value: string): value is CenturyMark => Object.hasOwn(CENTURY_BASE, value);

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

export const yearMatchesCentury = (year: number, century: CenturyMark): boolean => {
  const base = CENTURY_BASE[century];
  return year >= base && year <= base + 99;
};

export const centuryYearRange = (century: CenturyMark): readonly [number, number] => {
  const base = CENTURY_BASE[century];
  return [base, base + 99];
};

export const isRealDate = (year: number, month: number, day: number): boolean => {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }

  const utc = new Date(Date.UTC(year, month - 1, day));
  return utc.getUTCFullYear() === year && utc.getUTCMonth() === month - 1 && utc.getUTCDate() === day;
};

export const daysInMonth = (year: number, month: number): number =>
  new Date(Date.UTC(year, month, 0)).getUTCDate();

export const birthDateToken = (year: number, month: number, day: number): string =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

/**
 * Returns the UTC midnight `Date` for a calendar birth date.
 * Throws {@link HetuError} when that calendar day does not exist.
 */
export const birthDateToUtcDate = (birthDate: {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}): Date => {
  if (!isRealDate(birthDate.year, birthDate.month, birthDate.day)) {
    throw new HetuError('date', 'Invalid birth date', birthDateToken(birthDate.year, birthDate.month, birthDate.day));
  }

  return new Date(Date.UTC(birthDate.year, birthDate.month - 1, birthDate.day));
};

export const controlCharacter = (datePart: string, individualPart: string): string => {
  const raw = Number.parseInt(datePart + individualPart, 10);
  return HETU_ALPHABET.charAt(raw % 31);
};

export const genderOf = (individualNumber: number): Gender =>
  individualNumber % 2 === 0 ? 'female' : 'male';

const inIndividualRange = (individualNumber: number, range: { readonly min: number; readonly max: number }): boolean =>
  individualNumber >= range.min && individualNumber <= range.max;

export const isAllowedIndividual = (individualNumber: number): boolean =>
  inIndividualRange(individualNumber, PERMANENT_INDIVIDUAL) ||
  inIndividualRange(individualNumber, TEMPORARY_INDIVIDUAL);

const alignedBound = (bound: number, gender: Gender, toward: 'up' | 'down'): number => {
  const wantsEven = gender === 'female';
  const boundIsEven = bound % 2 === 0;

  if (boundIsEven === wantsEven) {
    return bound;
  }

  return toward === 'up' ? bound + 1 : bound - 1;
};

export const individualSeries = (
  gender: Gender,
  artificial: boolean,
): { readonly start: number; readonly count: number } => {
  const range = artificial ? TEMPORARY_INDIVIDUAL : PERMANENT_INDIVIDUAL;
  const start = alignedBound(range.min, gender, 'up');
  const end = alignedBound(range.max, gender, 'down');

  return { start, count: (end - start) / 2 + 1 };
};

export const readHetu = (value: unknown): HetuReadResult => {
  if (typeof value !== 'string' || value.length !== 11) {
    return { ok: false, reason: 'format' };
  }

  const datePart = value.slice(0, 6);
  const centuryChar = value.charAt(6);
  const individualPart = value.slice(7, 10);
  const controlChar = value.charAt(10);

  if (!/^\d{6}$/.test(datePart) || !/^\d{3}$/.test(individualPart) || !isCenturyMark(centuryChar)) {
    return { ok: false, reason: 'format' };
  }

  const individualNumber = Number.parseInt(individualPart, 10);
  if (!isAllowedIndividual(individualNumber)) {
    return { ok: false, reason: 'individual' };
  }

  const day = Number.parseInt(datePart.slice(0, 2), 10);
  const month = Number.parseInt(datePart.slice(2, 4), 10);
  const year = CENTURY_BASE[centuryChar] + Number.parseInt(datePart.slice(4, 6), 10);

  if (!isRealDate(year, month, day)) {
    return { ok: false, reason: 'date' };
  }

  if (controlChar !== controlCharacter(datePart, individualPart)) {
    return { ok: false, reason: 'checksum' };
  }

  return {
    ok: true,
    parts: {
      day,
      month,
      year,
      century: centuryChar,
      individualNumber,
      isTemporary: individualNumber >= TEMPORARY_INDIVIDUAL.min,
      gender: genderOf(individualNumber),
    },
  };
};
