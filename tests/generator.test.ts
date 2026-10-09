import { describe, expect, it } from 'vitest';
import { HetuError, generateTestHetu, isValidHetu, parseHetu } from '../src/index.js';

const zero = (): number => 0;
const high = (): number => 0.999;

describe('generator', () => {
  it('builds a known artificial code from a birth date', () => {
    const hetu = generateTestHetu({
      birthDate: { year: 1990, month: 1, day: 10 },
      century: 'Y',
      gender: 'male',
      random: high,
    });

    expect(hetu).toBe('100190Y999P');
    expect(parseHetu(hetu).isTemporary).toBe(true);
  });

  it('uses the permanent individual-number bounds', () => {
    const female = parseHetu(
      generateTestHetu({
        birthDate: { year: 1990, month: 1, day: 1 },
        century: '-',
        gender: 'female',
        artificial: false,
        random: high,
      }),
    );
    const male = parseHetu(
      generateTestHetu({
        birthDate: { year: 1990, month: 1, day: 1 },
        century: '-',
        gender: 'male',
        artificial: false,
        random: zero,
      }),
    );

    expect(female.individualNumber).toBe(898);
    expect(female.gender).toBe('female');
    expect(male.individualNumber).toBe(3);
    expect(male.gender).toBe('male');
  });

  it('places a separator-only request inside that separator century', () => {
    const hetu = generateTestHetu({ century: '+', gender: 'male', random: zero });
    const details = parseHetu(hetu);

    expect(details.birthDate).toEqual({ year: 1800, month: 1, day: 1 });
    expect(details.centuryCode).toBe('+');
    expect(details.individualNumber).toBe(901);
    expect(details.isTemporary).toBe(true);
  });

  it('derives the separator from an explicit birth date', () => {
    const details = parseHetu(
      generateTestHetu({
        birthDate: { year: 1890, month: 3, day: 15 },
        gender: 'female',
        random: zero,
      }),
    );

    expect(details.centuryCode).toBe('+');
    expect(details.birthDate).toEqual({ year: 1890, month: 3, day: 15 });
    expect(details.individualNumber).toBe(900);
    expect(details.isTemporary).toBe(true);

    const modern = parseHetu(
      generateTestHetu({
        birthDate: { year: 2004, month: 2, day: 29 },
        gender: 'female',
        random: zero,
      }),
    );
    expect(modern.centuryCode).toBe('A');
    expect(modern.birthDate).toEqual({ year: 2004, month: 2, day: 29 });
  });

  it('draws an undated code from the previous 80 UTC years', () => {
    const utcYear = new Date().getUTCFullYear();
    const details = parseHetu(generateTestHetu({ gender: 'female', random: zero }));

    expect(details.birthDate).toEqual({ year: utcYear - 80, month: 1, day: 1 });
    expect(isValidHetu(details.raw)).toBe(true);
    expect(details.individualNumber).toBe(900);
    expect(details.isTemporary).toBe(true);
  });

  it('throws a single error for an impossible date, a century mismatch, or a bad roll', () => {
    const impossible = (): unknown =>
      generateTestHetu({ birthDate: { year: 1900, month: 2, day: 29 } });
    const mismatch = (): unknown =>
      generateTestHetu({ birthDate: { year: 1990, month: 1, day: 1 }, century: '+' });
    const outOfRange = (): unknown => generateTestHetu({ birthDate: { year: 2100, month: 1, day: 1 } });
    const tooEarly = (): unknown => generateTestHetu({ birthDate: { year: 1799, month: 12, day: 31 } });
    const badRoll = (): unknown =>
      generateTestHetu({
        birthDate: { year: 1990, month: 1, day: 1 },
        gender: 'female',
        random: () => 1,
      });

    for (const build of [impossible, mismatch, outOfRange, tooEarly, badRoll]) {
      expect(build).toThrow(HetuError);
    }

    expect(impossible).toThrow(expect.objectContaining({ reason: 'date', value: '1900-02-29' }));
    expect(mismatch).toThrow(expect.objectContaining({ reason: 'options', value: '1990-01-01/+' }));
    expect(outOfRange).toThrow(expect.objectContaining({ reason: 'options', value: '2100-01-01' }));
    expect(tooEarly).toThrow(expect.objectContaining({ reason: 'options', value: '1799-12-31' }));
    expect(badRoll).toThrow(expect.objectContaining({ reason: 'options' }));
  });
});
