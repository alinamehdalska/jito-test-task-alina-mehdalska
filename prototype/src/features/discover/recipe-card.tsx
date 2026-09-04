import { Link } from 'react-router';

import { routes } from '@/app/routes';
import { PHOTOS } from '@/data/photos';
import type { Recipe } from '@/data/recipes';
import type { Reason } from '@/domain/match';
import { formatKcal } from '@/shared/lib/format';
import { ReasonChip } from '@/shared/ui/reason-chip';

const PUSH = { transition: 'push' } as const;

/**
 * Figma 37:58 "Recipe Card": photo on top, all text in a white body below. Text over food
 * photography was hard to scan and forced a heavy scrim; moving it out removes both.
 */
export function RecipeCard({
  recipe,
  reason,
}: {
  readonly recipe: Recipe;
  readonly reason: Reason;
}) {
  const photo = PHOTOS[recipe.photo].card;
  return (
    <Link
      to={routes.recipe(recipe.slug)}
      viewTransition
      state={PUSH}
      aria-label={`${recipe.name}, ${formatKcal(recipe.perServing.kcal)} kcal, ${String(recipe.minutes)} min, ${reason.label}`}
      className="flex flex-col overflow-hidden rounded-16 bg-bg-surface shadow-xs transition-transform duration-press ease-out active:scale-98"
    >
      <span className="relative block h-(--screen-card-photo-h) w-full">
        {photo && (
          <img src={photo} alt="" width={340} height={232} className="size-full object-cover" />
        )}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-b from-transparent to-bg-surface"
        />
      </span>
      <span className="flex flex-col items-start gap-8 p-12">
        <span className="type-subhead-emphasized text-text-primary">{recipe.name}</span>
        <span className="flex items-baseline gap-4">
          <span className="type-subhead-emphasized text-text-primary">
            {formatKcal(recipe.perServing.kcal)} kcal
          </span>
          <span className="type-caption-1 text-text-secondary">·</span>
          <span className="type-caption-1 text-text-secondary">{recipe.minutes} min</span>
        </span>
        <ReasonChip reason={reason} />
      </span>
    </Link>
  );
}
