import { describe, expect, it } from 'vitest';
import { isValidHetu } from '../src/index.js';

describe('validator', () => {
  it('accepts issued and new-separator codes with a real birth date', () => {
    expect(isValidHetu('131052-308T')).toBe(true);
    expect(isValidHetu('131052W308T')).toBe(true);
    expect(isValidHetu('290200A002C')).toBe(true);
    expect(isValidHetu('290296-0025')).toBe(true);
  });

  it('rejects impossible dates, reserved individual numbers, and lowercase check characters', () => {
    expect(isValidHetu('290200-002C')).toBe(false);
    expect(isValidHetu('310400-0029')).toBe(false);
    expect(isValidHetu('010199-0000')).toBe(false);
    expect(isValidHetu('010199-0011')).toBe(false);
    expect(isValidHetu('131052-308t')).toBe(false);
    expect(isValidHetu('131052-308X')).toBe(false);
  });

  it('rejects the wrong shape', () => {
    expect(isValidHetu('')).toBe(false);
    expect(isValidHetu('123456-123')).toBe(false);
    expect(isValidHetu('1234567-1234')).toBe(false);
    expect(isValidHetu('010199G123A')).toBe(false);
    expect(isValidHetu(null)).toBe(false);
  });
});
