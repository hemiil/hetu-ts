import { describe, expect, it } from 'vitest';
import { HetuError, birthDateToUtcDate, isValidHetu, parseHetu, type CenturyMark } from '../src/index.js';

describe('parser', () => {
  it('parses the canonical code', () => {
    const details = parseHetu('131052-308T');

    expect(details.birthDate).toEqual({ year: 1952, month: 10, day: 13 });
    expect(details.gender).toBe('female');
    expect(details.individualNumber).toBe(308);
    expect(details.centuryCode).toBe('-');
    expect(details.isTemporary).toBe(false);
    expect(details.raw).toBe('131052-308T');
  });

  it('maps every separator to its century', () => {
    const separators = [
      ['+', 1852],
      ['-', 1952],
      ['Y', 1952],
      ['X', 1952],
      ['W', 1952],
      ['V', 1952],
      ['U', 1952],
      ['A', 2052],
      ['B', 2052],
      ['C', 2052],
      ['D', 2052],
      ['E', 2052],
      ['F', 2052],
    ] as const;

    for (const [mark, year] of separators) {
      const hetu = `131052${mark}308T`;
      const century: CenturyMark = mark;

      expect(isValidHetu(hetu)).toBe(true);
      expect(parseHetu(hetu).birthDate).toEqual({ year, month: 10, day: 13 });
      expect(parseHetu(hetu).centuryCode).toBe(century);
    }
  });

  it('keeps the separator as part of identity for the same date and number', () => {
    const withY = parseHetu('100190Y999P');
    expect(withY.birthDate).toEqual({ year: 1990, month: 1, day: 10 });
    expect(withY.gender).toBe('male');
    expect(withY.individualNumber).toBe(999);
    expect(withY.isTemporary).toBe(true);
    expect(withY.centuryCode).toBe('Y');

    const withHyphen = parseHetu('100190-999P');
    expect(withHyphen.birthDate).toEqual(withY.birthDate);
    expect(withHyphen.individualNumber).toEqual(withY.individualNumber);
    expect(withHyphen.centuryCode).toBe('-');
    expect(withHyphen.raw).not.toBe(withY.raw);
  });

  it('parses a 2000s leap day and an artificial code', () => {
    expect(parseHetu('290200A002C').birthDate).toEqual({ year: 2000, month: 2, day: 29 });

    const artificial = parseHetu('010199-9001');
    expect(artificial.birthDate).toEqual({ year: 1999, month: 1, day: 1 });
    expect(artificial.gender).toBe('female');
    expect(artificial.isTemporary).toBe(true);
    expect(artificial.individualNumber).toBe(900);
  });

  it('throws HetuError without embedding the code in the message', () => {
    const cases = [
      ['290200-002C', 'date'],
      ['310400-0029', 'date'],
      ['010199-0000', 'individual'],
      ['131052-308t', 'checksum'],
      ['', 'format'],
    ] as const;

    for (const [value, reason] of cases) {
      try {
        parseHetu(value);
        expect.fail(`expected ${value || 'empty input'} to throw`);
      } catch (error) {
        expect(error).toBeInstanceOf(HetuError);
        const hetuError = error as HetuError;
        expect(hetuError.reason).toBe(reason);
        expect(hetuError.value).toBe(value);
        expect(hetuError.message).toBe('Invalid HETU');
        expect(value.length === 0 || !hetuError.message.includes(value)).toBe(true);
      }
    }
  });

  it('converts a birth date to UTC midnight', () => {
    expect(birthDateToUtcDate({ year: 1952, month: 10, day: 13 }).toISOString()).toBe(
      '1952-10-13T00:00:00.000Z',
    );
    expect(() => birthDateToUtcDate({ year: 1900, month: 2, day: 29 })).toThrow(HetuError);
  });
});
