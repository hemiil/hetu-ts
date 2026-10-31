import { describe, expect, it } from 'vitest';
import { HetuError, normalizeHetu, parseHetu, safeParseHetu } from '../src/index.js';

describe('safeParseHetu', () => {
  it('returns the same details as parseHetu for a valid code', () => {
    const result = safeParseHetu('131052-308T');

    expect(result).toEqual({ ok: true, details: parseHetu('131052-308T') });
  });

  it.each([
    ['131052-308', 'format'],
    ['131052-001T', 'individual'],
    ['300252-308T', 'date'],
    ['131052-308A', 'checksum'],
    [undefined, 'format'],
    [131052, 'format'],
  ])('rejects %o with reason %s', (value, reason) => {
    expect(safeParseHetu(value)).toEqual({ ok: false, reason });
  });
});

describe('normalizeHetu', () => {
  it('makes pasted input acceptable', () => {
    expect(parseHetu(normalizeHetu('  100190y999p\n')).raw).toBe('100190Y999P');
  });
});

describe('HetuError', () => {
  it('keeps the input out of serialized output', () => {
    const error = new HetuError('format', 'Invalid HETU', '131052-308T');

    expect(error.value).toBe('131052-308T');
    expect(Object.keys(error)).not.toContain('value');
    expect(JSON.stringify(error)).not.toContain('131052');
  });
});
