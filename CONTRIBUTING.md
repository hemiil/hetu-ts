# Contributing

Thanks for helping improve hetu-ts.

## Setup

The package requires Node.js 22 or newer and is ESM-only.

```bash
npm ci
npm run check
npm run build
```

`npm run check` typechecks `src` and `tests`, lints, checks formatting, and runs Vitest with coverage thresholds. `npm run format` fixes formatting. `npm run package-check` validates the built package with publint and Are the Types Wrong. `npm run smoke` builds the package, installs the tarball in a temporary project, and checks that the JavaScript and TypeScript entry points load.

## Changes

- Keep domain rules in their own modules (`century`, `calendar`, `individual`, `checksum`) and the reading logic in `read.ts`. The validator, the parser, and the test-code generator should use those instead of copying rules.
- Import internal modules with an explicit `.js` extension.
- Add or update a fixed test vector when a personal-identity-code rule changes.
- Do not commit `dist/` or `coverage/`. The publish step builds `dist`.
- Do not add example codes that are real personal identity codes. Use the fixed fictional vectors already in the tests.

## Pull requests

Describe the behavior change and how you tested it. A domain change needs a test that would fail on the previous behavior.
