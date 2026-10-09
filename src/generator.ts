import { HetuError } from './error.js';
import {
  birthDateToken,
  centuryYearRange,
  controlCharacter,
  daysInMonth,
  defaultCentury,
  individualSeries,
  isRealDate,
  yearMatchesCentury,
} from './rules.js';
import type { BirthDate, CenturyMark, Gender, GenerateHetuOptions } from './types.js';
import { isValidHetu } from './validator.js';

const INVALID_OPTIONS = 'Cannot build a HETU from the given options';

const pickIndex = (random: () => number, span: number): number => {
  const rolled = random();
  const index = Math.floor(rolled * span);

  if (!Number.isFinite(rolled) || index < 0 || index >= span) {
    throw new HetuError('options', INVALID_OPTIONS, '');
  }

  return index;
};

const randomBirthDate = (startYear: number, endYear: number, random: () => number): BirthDate => {
  const year = startYear + pickIndex(random, endYear - startYear + 1);
  const month = 1 + pickIndex(random, 12);
  const day = 1 + pickIndex(random, daysInMonth(year, month));

  return { year, month, day };
};

const resolveBirthDate = (options: GenerateHetuOptions, random: () => number): BirthDate => {
  const birthDate = options.birthDate;

  if (birthDate) {
    if (!isRealDate(birthDate.year, birthDate.month, birthDate.day)) {
      throw new HetuError(
        'date',
        'Invalid birth date',
        birthDateToken(birthDate.year, birthDate.month, birthDate.day),
      );
    }

    if (options.century && !yearMatchesCentury(birthDate.year, options.century)) {
      throw new HetuError(
        'options',
        INVALID_OPTIONS,
        `${birthDateToken(birthDate.year, birthDate.month, birthDate.day)}/${options.century}`,
      );
    }

    return { year: birthDate.year, month: birthDate.month, day: birthDate.day };
  }

  if (options.century) {
    const [startYear, endYear] = centuryYearRange(options.century);
    return randomBirthDate(startYear, endYear, random);
  }

  const utcYear = new Date().getUTCFullYear();
  return randomBirthDate(utcYear - 80, utcYear - 1, random);
};

const resolveCentury = (birthDate: BirthDate, explicitCentury: CenturyMark | undefined): CenturyMark => {
  if (explicitCentury) {
    return explicitCentury;
  }

  const century = defaultCentury(birthDate.year);

  if (!century) {
    throw new HetuError(
      'options',
      INVALID_OPTIONS,
      birthDateToken(birthDate.year, birthDate.month, birthDate.day),
    );
  }

  return century;
};

const randomIndividual = (gender: Gender, artificial: boolean, random: () => number): number => {
  const series = individualSeries(gender, artificial);
  return series.start + 2 * pickIndex(random, series.count);
};

const formatHetu = (birthDate: BirthDate, century: CenturyMark, individualNumber: number): string => {
  const day = String(birthDate.day).padStart(2, '0');
  const month = String(birthDate.month).padStart(2, '0');
  const year = String(birthDate.year).slice(-2);
  const datePart = `${day}${month}${year}`;
  const individualPart = String(individualNumber).padStart(3, '0');

  return `${datePart}${century}${individualPart}${controlCharacter(datePart, individualPart)}`;
};

/**
 * Builds a structurally valid personal identity code for tests.
 * The individual number is artificial (900–999) unless `artificial` is `false`.
 * The result is not an issued identity and must not be used as production or personal data.
 */
export const generateTestHetu = (options: GenerateHetuOptions = {}): string => {
  const random = options.random ?? Math.random;
  const birthDate = resolveBirthDate(options, random);
  const century = resolveCentury(birthDate, options.century);
  const gender = options.gender ?? (pickIndex(random, 2) === 0 ? 'male' : 'female');
  const individualNumber = randomIndividual(gender, options.artificial !== false, random);
  const candidate = formatHetu(birthDate, century, individualNumber);

  if (!isValidHetu(candidate)) {
    throw new HetuError('options', INVALID_OPTIONS, candidate);
  }

  return candidate;
};
