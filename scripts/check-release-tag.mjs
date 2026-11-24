import { readFileSync } from 'node:fs';

const version = JSON.parse(readFileSync(new URL('../package.json', import.meta.url))).version;
const expected = `v${version}`;
const actual = process.env.GITHUB_REF_NAME;

if (actual !== expected) {
  console.error(`Expected tag ${expected}, got ${actual ?? '<unset>'}`);
  process.exit(1);
}
