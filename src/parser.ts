import { HetuError } from './error.js';
import { readHetu } from './rules.js';
import type { HetuDetails } from './types.js';

/**
 * Parses a Finnish personal identity code.
 * Throws {@link HetuError} when the code is invalid. The message stays generic;
 * the original input is on `error.value`.
 */
export const parseHetu = (hetu: string): HetuDetails => {
  const result = readHetu(hetu);

  if (!result.ok) {
    throw new HetuError(result.reason, 'Invalid HETU', hetu);
  }

  const { parts } = result;

  return {
    raw: hetu,
    birthDate: {
      year: parts.year,
      month: parts.month,
      day: parts.day,
    },
    gender: parts.gender,
    centuryCode: parts.century,
    individualNumber: parts.individualNumber,
    isTemporary: parts.isTemporary,
  };
};
