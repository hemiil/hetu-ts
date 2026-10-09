# hetu-ts

Zero-dependency TypeScript library for Finnish personal identity codes (henkilötunnus).

A valid result means the code has the legal shape: a real birth date, an allowed individual number, and a matching check character. It does not mean that a person or an issued code exists. Do not use a code as authentication or authorization evidence.

Requires Node.js 20 or newer. The package is ESM-only.

```bash
npm install @hemiil/hetu
```

## Format

A code has the form `DDMMYYCZZZQ`:

- `DDMMYY` is the birth date
- `C` is the century separator
- `ZZZ` is the individual number
- `Q` is the check character from `0123456789ABCDEFHJKLMNPRSTUVWXY` (the nine-digit number `DDMMYYZZZ` modulo 31)

The check character is an uppercase letter or a digit. Lowercase letters are rejected.

## Separators

| Separator | Years |
| --- | --- |
| `+` | 1800–1899 |
| `-`, `Y`, `X`, `W`, `V`, `U` | 1900–1999 |
| `A`, `B`, `C`, `D`, `E`, `F` | 2000–2099 |

Since 2023 the separator is part of the identity. `100190-999P` and `100190Y999P` are different people even when the birth date and individual number match. `CENTURY_BASE` exports the same table.

## Individual number

Issued numbers are `002`–`899`. Odd numbers are male and even numbers are female. `900`–`999` are artificial codes and use the same parity rule. `000` and `001` are rejected. `HetuDetails.isTemporary` is `true` for the artificial range.

## Usage

```ts
import {
  HetuError,
  birthDateToUtcDate,
  generateTestHetu,
  isValidHetu,
  parseHetu,
} from '@hemiil/hetu';

isValidHetu('131052-308T');
// true

const details = parseHetu('131052-308T');
details.birthDate;
// { year: 1952, month: 10, day: 13 }
details.gender;
// 'female'
details.centuryCode;
// '-'

birthDateToUtcDate(details.birthDate);
// 1952-10-13T00:00:00.000Z

try {
  parseHetu('290200-002C');
} catch (error) {
  if (error instanceof HetuError) {
    error.reason;
    // 'date'
    error.value;
    // '290200-002C'
  }
}
```

`BirthDate` is a calendar day. `month` and `day` start at 1. Convert it with `birthDateToUtcDate` when a UTC midnight `Date` is required.

## Test codes

`generateTestHetu` builds structurally valid test data. It does not issue real identity codes, and its output must not be stored as personal or production data.

By default the individual number is artificial (`900`–`999`). Pass `artificial: false` only when a test needs the shape of an issued number (`002`–`899`). Those values can collide with a real code. Pass `random` when a test needs a fixed roll.

```ts
const artificial = generateTestHetu({
  birthDate: { year: 1990, month: 1, day: 10 },
  century: 'Y',
  gender: 'male',
  random: () => 0.999,
});
// '100190Y999P'

const issuedShape = generateTestHetu({
  birthDate: { year: 1990, month: 1, day: 1 },
  gender: 'female',
  artificial: false,
  random: () => 0,
});
```

## Public types

| Type | Meaning |
| --- | --- |
| `BirthDate` | `{ year, month, day }` |
| `CenturyMark` | One separator from `CENTURY_BASE` |
| `Gender` | `'male'` or `'female'` |
| `HetuDetails` | Result of `parseHetu` |
| `ValidHetu` | String narrowed by `isValidHetu` |
| `GenerateHetuOptions` | Options for `generateTestHetu` |
| `HetuError` | Thrown for invalid input, with `reason` and `value` |
| `HetuErrorReason` | `'format'`, `'date'`, `'individual'`, `'checksum'`, or `'options'` |

`HetuError.message` stays generic. The rejected input is on `error.value`, so logging it is the caller's decision.

## Development

```bash
npm ci
npm test
npm run build
npm run smoke
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for pull requests and [SECURITY.md](SECURITY.md) for vulnerability reports.

## License

[MIT](LICENSE)
