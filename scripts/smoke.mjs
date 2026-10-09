import { execFileSync } from 'node:child_process';
import { mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const directory = await mkdtemp(join(tmpdir(), 'hetu-smoke-'));

const runtimeCheck = `
import { HetuError, birthDateToUtcDate, generateTestHetu, isValidHetu, parseHetu } from '@hemiil/hetu';

const code = '131052-308T';
if (!isValidHetu(code)) {
  throw new Error('expected the canonical code to be valid');
}

const details = parseHetu(code);
if (details.birthDate.year !== 1952 || details.birthDate.month !== 10 || details.birthDate.day !== 13) {
  throw new Error('unexpected birth date');
}
if (details.gender !== 'female') {
  throw new Error('unexpected gender');
}

const utc = birthDateToUtcDate(details.birthDate);
if (utc.toISOString() !== '1952-10-13T00:00:00.000Z') {
  throw new Error('unexpected UTC date');
}

const generated = parseHetu(generateTestHetu({ gender: 'female', random: () => 0 }));
if (!generated.isTemporary || generated.individualNumber !== 900) {
  throw new Error('expected the default test code to be artificial');
}

let rejected = false;
try {
  parseHetu('nope');
} catch (error) {
  if (!(error instanceof HetuError) || error.reason !== 'format') {
    throw error;
  }
  rejected = true;
}
if (!rejected) {
  throw new Error('expected an invalid code to throw');
}
`;

try {
  execFileSync('npm', ['run', 'build'], { cwd: root, stdio: 'inherit' });
  execFileSync('npm', ['pack', '--pack-destination', directory], { cwd: root, stdio: 'inherit' });

  const packed = (await readdir(directory)).find((name) => name.endsWith('.tgz'));
  if (!packed) {
    throw new Error('package tarball was not created');
  }

  await writeFile(
    join(directory, 'package.json'),
    JSON.stringify({ name: 'hetu-smoke', private: true, type: 'module' }, null, 2),
  );
  execFileSync('npm', ['install', '--no-fund', '--no-audit', join(directory, packed)], {
    cwd: directory,
    stdio: 'inherit',
  });

  await writeFile(join(directory, 'smoke.mjs'), runtimeCheck);
  execFileSync(process.execPath, [join(directory, 'smoke.mjs')], { cwd: directory, stdio: 'inherit' });

  await writeFile(join(directory, 'smoke.ts'), runtimeCheck);
  execFileSync(
    join(root, 'node_modules', '.bin', 'tsc'),
    [
      '--noEmit',
      '--strict',
      '--module',
      'NodeNext',
      '--moduleResolution',
      'NodeNext',
      '--target',
      'ES2022',
      '--lib',
      'ES2022',
      join(directory, 'smoke.ts'),
    ],
    { cwd: directory, stdio: 'inherit' },
  );
} finally {
  await rm(directory, { recursive: true, force: true });
}
