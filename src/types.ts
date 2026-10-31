/** Century separator: `+` 1800s, `-` `Y` `X` `W` `V` `U` 1900s, `A`–`F` 2000s. */
export type CenturyMark =
  | '+'
  | '-'
  | 'Y'
  | 'X'
  | 'W'
  | 'V'
  | 'U'
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F';

export type Gender = 'male' | 'female';

/** Calendar birth date. `month` and `day` start at 1. */
export type BirthDate = {
  readonly year: number;
  readonly month: number;
  readonly day: number;
};

/**
 * Parsed Finnish personal identity code.
 * Since 2023 the separator is part of the identity: `100190-999P` and
 * `100190Y999P` are different people even when the birth date and individual
 * number match.
 */
export type HetuDetails = {
  /** The input, as given. */
  readonly raw: ValidHetu;
  readonly birthDate: BirthDate;
  readonly gender: Gender;
  readonly centuryCode: CenturyMark;
  readonly individualNumber: number;
  /** `true` when the individual number is in the artificial range 900–999. */
  readonly isTemporary: boolean;
};

/** A string that has passed {@link isValidHetu} or {@link parseHetu}. */
export type ValidHetu = string & { readonly __brand: unique symbol };

/** Options for {@link generateTestHetu}. */
export type GenerateHetuOptions = {
  readonly birthDate?: BirthDate;
  readonly gender?: Gender;
  readonly century?: CenturyMark;
  /**
   * When `true` (the default), the individual number is in the artificial
   * range 900–999. Set `false` only for tests that need the shape of an
   * issued number, 002–899.
   */
  readonly artificial?: boolean;
  /** Source of randomness in the range [0, 1). Defaults to `Math.random`. */
  readonly random?: () => number;
  /** Clock for the default birth-date range (previous 80 UTC years). Defaults to now. */
  readonly now?: Date;
};
