/** Why validation or test-code generation rejected its input. */
export type HetuErrorReason = 'format' | 'date' | 'individual' | 'checksum' | 'options';

/**
 * Failure from parsing a code or building a test code.
 * `message` does not include the input. `value` holds it for the caller to log.
 */
export class HetuError extends Error {
  readonly reason: HetuErrorReason;
  readonly value: string;

  constructor(reason: HetuErrorReason, message: string, value: string) {
    super(message);
    this.name = 'HetuError';
    this.reason = reason;
    this.value = value;
  }
}
