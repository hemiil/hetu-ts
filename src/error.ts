/** Why a code was rejected while reading it. */
export type HetuReadFailure = 'format' | 'date' | 'individual' | 'checksum';

/** Why validation or test-code generation rejected its input. */
export type HetuErrorReason = HetuReadFailure | 'options';

/**
 * Failure from parsing a code or building a test code.
 * `message` does not include the input. `value` holds it for the caller to log;
 * it is not enumerable, so loggers and serializers do not pick it up by accident.
 */
export class HetuError extends Error {
  readonly reason: HetuErrorReason;
  declare readonly value: string;

  constructor(reason: HetuErrorReason, message: string, value: string) {
    super(message);
    this.name = 'HetuError';
    this.reason = reason;
    Object.defineProperty(this, 'value', { value, enumerable: false });
  }
}
