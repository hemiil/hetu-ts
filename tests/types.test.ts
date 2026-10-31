import { describe, expectTypeOf, it } from 'vitest';
import {
  generateTestHetu,
  isValidHetu,
  parseHetu,
  type HetuDetails,
  type ValidHetu,
} from '../src/index.js';

describe('types', () => {
  it('narrows unknown input to ValidHetu', () => {
    const input: unknown = '131052-308T';

    if (isValidHetu(input)) {
      expectTypeOf(input).toEqualTypeOf<ValidHetu>();
    }
  });

  it('carries the brand through parsing and generation', () => {
    expectTypeOf(parseHetu('131052-308T').raw).toEqualTypeOf<ValidHetu>();
    expectTypeOf(generateTestHetu()).toEqualTypeOf<ValidHetu>();
    expectTypeOf<ValidHetu>().toExtend<string>();
    expectTypeOf<string>().not.toExtend<ValidHetu>();
    expectTypeOf<HetuDetails['raw']>().toEqualTypeOf<ValidHetu>();
  });
});
