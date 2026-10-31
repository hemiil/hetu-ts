import { CENTURY_BASE, isCenturyMark } from './century.js';
import { controlCharacter } from './checksum.js';
import { isRealDate } from './calendar.js';
import type { HetuReadFailure } from './error.js';
import { genderOf, isAllowedIndividual, isTemporaryIndividual } from './individual.js';
import type { BirthDate, CenturyMark, Gender } from './types.js';

export type HetuParts = {
  readonly birthDate: BirthDate;
  readonly century: CenturyMark;
  readonly individualNumber: number;
  readonly isTemporary: boolean;
  readonly gender: Gender;
};

export type HetuReadResult =
  | { readonly ok: true; readonly parts: HetuParts }
  | { readonly ok: false; readonly reason: HetuReadFailure };

const fail = (reason: HetuReadFailure): HetuReadResult => ({ ok: false, reason });

/** Reads any value as a code without throwing. */
export const readHetu = (value: unknown): HetuReadResult => {
  if (typeof value !== 'string' || value.length !== 11) {
    return fail('format');
  }

  const datePart = value.slice(0, 6);
  const century = value.charAt(6);
  const individualPart = value.slice(7, 10);
  const check = value.charAt(10);

  if (!/^\d{6}$/.test(datePart) || !/^\d{3}$/.test(individualPart) || !isCenturyMark(century)) {
    return fail('format');
  }

  const individualNumber = Number.parseInt(individualPart, 10);
  if (!isAllowedIndividual(individualNumber)) {
    return fail('individual');
  }

  const birthDate: BirthDate = {
    year: CENTURY_BASE[century] + Number.parseInt(datePart.slice(4, 6), 10),
    month: Number.parseInt(datePart.slice(2, 4), 10),
    day: Number.parseInt(datePart.slice(0, 2), 10),
  };
  if (!isRealDate(birthDate)) {
    return fail('date');
  }

  if (check !== controlCharacter(datePart, individualPart)) {
    return fail('checksum');
  }

  return {
    ok: true,
    parts: {
      birthDate,
      century,
      individualNumber,
      isTemporary: isTemporaryIndividual(individualNumber),
      gender: genderOf(individualNumber),
    },
  };
};
