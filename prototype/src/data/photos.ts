import greekYogurtProduct from '@/assets/photos/greek-yogurt-product.webp';
import misoBowlCard from '@/assets/photos/miso-bowl-card.webp';
import misoBowlHero from '@/assets/photos/miso-bowl-hero.webp';
import quinoaSaladThumb from '@/assets/photos/quinoa-salad-thumb.webp';
import salmonBowlCard from '@/assets/photos/salmon-bowl-card.webp';
import salmonBowlHero from '@/assets/photos/salmon-bowl-hero.webp';
import shakshukaCard from '@/assets/photos/shakshuka-card.webp';
import shakshukaHero from '@/assets/photos/shakshuka-hero.webp';
import trailMixThumb from '@/assets/photos/trail-mix-thumb.webp';
import tunaNicoiseCard from '@/assets/photos/tuna-nicoise-card.webp';
import tunaNicoiseHero from '@/assets/photos/tuna-nicoise-hero.webp';
import yogurtBowlThumb from '@/assets/photos/yogurt-bowl-thumb.webp';
import type { PhotoKey } from '@/domain/types';

interface PhotoSet {
  /** 44 × 44 diary thumbnail (88 px source). */
  readonly thumb?: string | undefined;
  /** 56 × 56 product result (112 px source). */
  readonly product?: string | undefined;
  /** 170 × 116 recipe card (340 × 232 source). */
  readonly card?: string | undefined;
  /** 393 × 286 recipe hero (786 × 572 source). */
  readonly hero?: string | undefined;
}

/**
 * Pexels photography, content-matched per dish (README → Photography), exported from the
 * Figma file once and sized by scripts/build-images.ts. Every image is decorative next to
 * its dish name, so consumers render it with an empty alt.
 */
export const PHOTOS: Readonly<Record<PhotoKey, PhotoSet>> = {
  'yogurt-bowl': { thumb: yogurtBowlThumb },
  'quinoa-salad': { thumb: quinoaSaladThumb },
  'trail-mix': { thumb: trailMixThumb },
  'greek-yogurt': { product: greekYogurtProduct },
  'salmon-bowl': { card: salmonBowlCard, hero: salmonBowlHero },
  'miso-bowl': { card: misoBowlCard, hero: misoBowlHero },
  shakshuka: { card: shakshukaCard, hero: shakshukaHero },
  'tuna-nicoise': { card: tunaNicoiseCard, hero: tunaNicoiseHero },
};

/**
 * The 44pt diary thumbnail. Products were exported at 112 and recipes at 340, so an entry
 * logged from either borrows the nearest size; object-fit crops it. Only seed meals have an
 * 88 px source.
 */
export function thumbFor(photo: PhotoKey | undefined): string | undefined {
  if (!photo) return undefined;
  const sizes = PHOTOS[photo];
  return sizes.thumb ?? sizes.product ?? sizes.card;
}
