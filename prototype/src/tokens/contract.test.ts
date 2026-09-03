import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { generateCss } from './generate.ts';

const projectRoot = resolve(import.meta.dirname, '../..');
const generatedFile = resolve(projectRoot, 'src/styles/tokens.generated.css');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

// The token pipeline itself (src/tokens) is exempt: it is the thing that turns hex into tokens.
const sourceFiles = walk(resolve(projectRoot, 'src')).filter(
  (file) => /\.(tsx?|css)$/.test(file) && file !== generatedFile && !file.includes('/src/tokens/'),
);

describe('design-system contract', () => {
  it('the committed tokens.generated.css matches tokens.json (run `pnpm tokens` if not)', () => {
    const tokens: unknown = JSON.parse(
      readFileSync(resolve(projectRoot, '../tokens.json'), 'utf8'),
    );
    expect(readFileSync(generatedFile, 'utf8')).toBe(generateCss(tokens));
  });

  it('no source file hardcodes a colour', () => {
    const offenders = sourceFiles.filter((file) =>
      /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|oklch\(/i.test(readFileSync(file, 'utf8')),
    );
    expect(offenders.map((file) => relative(projectRoot, file))).toEqual([]);
  });

  it('no source file reaches past the semantic layer to a primitive colour', () => {
    const offenders = sourceFiles.filter((file) =>
      readFileSync(file, 'utf8').includes('--plate-color-'),
    );
    expect(offenders.map((file) => relative(projectRoot, file))).toEqual([]);
  });
});
