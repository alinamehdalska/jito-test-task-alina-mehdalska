import { useState } from 'react';

import { RECIPES } from '@/data/recipes';
import { applyFilters, FILTER_IDS, FILTER_LABEL, type FilterId, reasonFor } from '@/domain/match';
import { remainingForDay } from '@/features/diary/selectors';
import { useDiaryStore } from '@/features/diary/store';
import { useToday } from '@/features/diary/use-today';
import { RecipeCard } from '@/features/discover/recipe-card';
import { formatKcal } from '@/shared/lib/format';
import { EmptyState } from '@/shared/ui/empty-state';
import { FilterPill } from '@/shared/ui/filter-pill';
import { Icon } from '@/shared/ui/icon';
import { SearchInput } from '@/shared/ui/search-input';

/**
 * Frame 4, "Recipe Discovery" — User Story 2. The recommendation is personal in plain
 * words: what is left today drives every card's reason, and it changes as the diary does.
 */
export function DiscoveryScreen() {
  const today = useToday();
  const goal = useDiaryStore((state) => state.goal);
  const entries = useDiaryStore((state) => state.entries);
  const remaining = remainingForDay(goal, entries, today);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<ReadonlySet<FilterId>>(() => new Set<FilterId>(['fits']));

  const toggle = (filter: FilterId) => {
    setActive((current) => {
      const next = new Set(current);
      if (next.has(filter)) next.delete(filter);
      else next.add(filter);
      return next;
    });
  };

  const recipes = applyFilters(RECIPES, active, remaining, query);

  return (
    <div className="flex flex-col gap-12 px-20 pt-4">
      <h1 className="type-large-title text-text-primary">Discover</h1>

      <section
        aria-labelledby="recommended"
        className="flex flex-col gap-4 rounded-20 bg-bg-surface px-16 py-12 shadow-xs"
      >
        <div className="flex items-center justify-between">
          <h2 id="recommended" className="type-headline text-text-primary">
            Recommended for you
          </h2>
          <span className="inline-flex h-24 items-center gap-8 rounded-8 bg-feedback-success-surface px-8 type-caption-2 text-feedback-success">
            <span aria-hidden="true" className="size-4 rounded-full bg-feedback-success" />
            {formatKcal(remaining)} kcal left
          </span>
        </div>
        <p className="type-caption-1 text-text-secondary">
          Matched against the calories and macros you have left.
        </p>
      </section>

      <div className="flex items-center gap-12">
        <SearchInput
          label="Search recipes"
          placeholder="Search recipes"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
        />
        <button
          type="button"
          aria-label="Filters"
          className="flex size-control-cta shrink-0 items-center justify-center rounded-full border border-border-subtle bg-bg-surface text-text-primary"
        >
          <Icon name="sliders-horizontal" className="size-20" />
        </button>
      </div>

      <div role="group" aria-label="Filter recipes" className="flex flex-wrap gap-8">
        {FILTER_IDS.map((filter) => (
          <FilterPill
            key={filter}
            label={FILTER_LABEL[filter]}
            selected={active.has(filter)}
            onToggle={() => {
              toggle(filter);
            }}
          />
        ))}
      </div>

      {recipes.length === 0 ? (
        <EmptyState
          icon="bowl-food"
          title="Nothing fits those filters"
          body="Loosen a filter, or log a lighter lunch and check back."
        />
      ) : (
        <ul aria-label="Recipes" className="grid grid-cols-2 gap-12">
          {recipes.map((recipe) => (
            <li key={recipe.slug} className="flex">
              <RecipeCard recipe={recipe} reason={reasonFor(recipe, remaining)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
