/**
 * One-off: turns the Pexels sources exported from Figma (assets-src/, git-ignored) into the
 * WebP files the prototype ships, at 2× of their rendered size. Re-run with `pnpm images`.
 *
 * Photography is Pexels, free for commercial use, content-matched per dish — see README.
 * The avatar portrait is deliberately not processed: it has no licence record, so the
 * prototype renders initials instead.
 */

import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

import sharp from 'sharp';

const projectRoot = resolve(import.meta.dirname, '..');
const sourceDir = resolve(projectRoot, 'assets-src');
const outputDir = resolve(projectRoot, 'src', 'assets', 'photos');

interface Job {
  readonly source: string;
  readonly output: string;
  readonly width: number;
  readonly height: number;
}

/** Rendered sizes: hero 393×286, recipe card 170×116, product 56×56, diary thumb 44×44. */
const HERO = { width: 786, height: 572 };
const CARD = { width: 340, height: 232 };
const PRODUCT = { width: 112, height: 112 };
const THUMB = { width: 88, height: 88 };

const JOBS: readonly Job[] = [
  { source: 'salmon-hero.jpeg', output: 'salmon-bowl-hero.webp', ...HERO },
  { source: 'discovery-2.jpeg', output: 'salmon-bowl-card.webp', ...CARD },
  { source: 'discovery-1.jpeg', output: 'miso-bowl-hero.webp', ...HERO },
  { source: 'discovery-1.jpeg', output: 'miso-bowl-card.webp', ...CARD },
  { source: 'discovery-3.jpeg', output: 'shakshuka-hero.webp', ...HERO },
  { source: 'discovery-3.jpeg', output: 'shakshuka-card.webp', ...CARD },
  { source: 'discovery-4.jpeg', output: 'tuna-nicoise-hero.webp', ...HERO },
  { source: 'discovery-4.jpeg', output: 'tuna-nicoise-card.webp', ...CARD },
  { source: 'product-yogurt.jpeg', output: 'greek-yogurt-product.webp', ...PRODUCT },
  { source: 'dashboard-3.jpeg', output: 'yogurt-bowl-thumb.webp', ...THUMB },
  { source: 'dashboard-4.jpeg', output: 'quinoa-salad-thumb.webp', ...THUMB },
  { source: 'dashboard-2.jpeg', output: 'trail-mix-thumb.webp', ...THUMB },
];

mkdirSync(outputDir, { recursive: true });

for (const job of JOBS) {
  const info = await sharp(resolve(sourceDir, job.source))
    .resize(job.width, job.height, { fit: 'cover', position: 'centre' })
    .webp({ quality: 78 })
    .toFile(resolve(outputDir, job.output));
  console.log(
    `${job.output.padEnd(28)} ${String(info.width)}×${String(info.height)}  ${String(Math.round(info.size / 1024))} KB`,
  );
}
