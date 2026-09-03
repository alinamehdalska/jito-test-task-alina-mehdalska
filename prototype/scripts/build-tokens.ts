/**
 * Regenerates src/styles/tokens.generated.css from ../tokens.json.
 * `--check` exits 1 when the committed file is stale (used by CI and lint-staged).
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { generateCss } from '../src/tokens/generate.ts';

const projectRoot = resolve(import.meta.dirname, '..');
const source = resolve(projectRoot, '..', 'tokens.json');
const output = resolve(projectRoot, 'src', 'styles', 'tokens.generated.css');

const css = generateCss(JSON.parse(readFileSync(source, 'utf8')));

if (process.argv.includes('--check')) {
  let committed = '';
  try {
    committed = readFileSync(output, 'utf8');
  } catch {
    committed = '';
  }
  if (committed !== css) {
    console.error(
      `${output} is out of date with tokens.json — run \`pnpm tokens\` and commit the result.`,
    );
    process.exit(1);
  }
  console.log('tokens.generated.css is in sync with tokens.json');
} else {
  writeFileSync(output, css);
  console.log(`wrote ${output}`);
}
