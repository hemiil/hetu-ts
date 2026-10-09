# Contributing

Thanks for helping improve hetu-ts.

## Setup

The package requires Node.js 20 or newer and is ESM-only.

```bash
npm ci
npm test
npm run build
```

`npm test` typechecks `src` and `tests`, then runs Vitest. `npm run smoke` builds the package, installs the tarball in a temporary project, and checks that the JavaScript and TypeScript entry points load.

## Changes

- Keep domain rules in `src/rules.ts`. Validators, the parser, and the test-code generator should use those rules instead of copying them.
- Import internal modules with an explicit `.js` extension.
- Add or update a fixed test vector when a personal-identity-code rule changes.
- Do not commit `dist/` or `coverage/`. The publish step builds `dist`.
- Do not add example codes that are real personal identity codes. Use the fixed fictional vectors already in the tests.

## Pull requests

Describe the behavior change and how you tested it. A domain change needs a test that would fail on the previous behavior.
