import { HetuError } from './error.js';
import type { HetuReadFailure } from './error.js';
import { readHetu } from './read.js';
import type { HetuDetails, ValidHetu } from './types.js';

/** Outcome of {@link safeParseHetu}: details on success, the rejection reason otherwise. */
export type HetuParseResult =
  | { readonly ok: true; readonly details: HetuDetails }
  | { readonly ok: false; readonly reason: HetuReadFailure };

/**
 * Parses a Finnish personal identity code without throwing.
 * Accepts any value; anything but a valid code yields `{ ok: false, reason }`.
 */
export const safeParseHetu = (value: unknown): HetuParseResult => {
  const result = readHetu(value);

  if (!result.ok) {
    return result;
  }

  const { parts } = result;

  return {
    ok: true,
    details: {
      raw: value as ValidHetu,
      birthDate: parts.birthDate,
      gender: parts.gender,
      centuryCode: parts.century,
      individualNumber: parts.individualNumber,
      isTemporary: parts.isTemporary,
    },
  };
};

/**
 * Parses a Finnish personal identity code.
 * Throws {@link HetuError} when the code is invalid. The message stays generic;
 * the original input is on `error.value`.
 */
export const parseHetu = (hetu: string): HetuDetails => {
  const result = safeParseHetu(hetu);

  if (!result.ok) {
    throw new HetuError(result.reason, 'Invalid HETU', hetu);
  }

  return result.details;
};
