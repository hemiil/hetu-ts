# Changelog

## 1.0.0 - 2026-10-31

First public release.

- Validate a Finnish personal identity code, including the century separators in use since 2023.
- Parse a code into a calendar `BirthDate`, gender, separator, and individual number.
- Generate test codes in the artificial individual-number range 900–999 by default.
- Reject impossible calendar dates, individual numbers 000 and 001, and lowercase check characters.
- `safeParseHetu` returns a result instead of throwing; `normalizeHetu` trims and uppercases pasted input.
- `generateTestHetu` accepts `now` for a deterministic default date range and returns `ValidHetu`.
- `HetuError.value` is not enumerable, so the input stays out of logs and serialized errors.
