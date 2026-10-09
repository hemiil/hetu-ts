import { readHetu } from './rules.js';
import type { ValidHetu } from './types.js';

/**
 * Returns whether `value` has the shape of a Finnish personal identity code:
 * a real birth date, an allowed individual number, and a matching check character.
 * A valid result does not prove that a person or an issued code exists.
 */
export const isValidHetu = (value: unknown): value is ValidHetu => readHetu(value).ok;
