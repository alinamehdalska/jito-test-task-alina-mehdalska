import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';

import { routes } from '@/app/routes';
import { PHOTOS } from '@/data/photos';
import { findProduct, searchProducts } from '@/data/products';
import type { Product } from '@/domain/types';
import { useCalculatorStore } from '@/features/calculator/store';
import { useDiaryStore } from '@/features/diary/store';
import { Screen } from '@/shared/chrome/screen';
import { ScreenHeader } from '@/shared/chrome/screen-header';
import { formatKcal } from '@/shared/lib/format';
import { useAppNavigate, useGoBack } from '@/shared/lib/use-app-navigate';
import { SearchInput } from '@/shared/ui/search-input';

/** Frame 7b → 2 fires after 1.2 s in the Figma prototype; a real search would feel like this. */
export const SEARCH_LATENCY_MS = 800;
const SKELETON_ROWS = 3;

function SkeletonRow() {
  return (
    <li
      aria-hidden="true"
      className="flex items-center gap-12 rounded-20 bg-bg-surface p-16 shadow-xs"
    >
      <span className="size-control-fab shrink-0 rounded-12 bg-bg-sunken" />
      <span className="flex flex-1 flex-col gap-4">
        <span className="h-12 w-3/5 rounded-full bg-bg-sunken" />
        <span className="h-8 w-1/4 rounded-full bg-bg-sunken" />
      </span>
    </li>
  );
}

function ResultRow({
  product,
  onSelect,
}: {
  readonly product: Product;
  readonly onSelect: (product: Product) => void;
}) {
  const photo = product.photo ? PHOTOS[product.photo].product : undefined;
  return (
    <li>
      <button
        type="button"
        onClick={() => {
          onSelect(product);
        }}
        className="flex w-full items-center gap-12 rounded-20 bg-bg-surface p-16 text-left shadow-xs transition-colors duration-press active:bg-bg-raised"
      >
        {photo ? (
          <img
            src={photo}
            alt=""
            width={56}
            height={56}
            className="size-control-fab shrink-0 rounded-12 object-cover"
          />
        ) : (
          <span aria-hidden="true" className="size-control-fab shrink-0 rounded-12 bg-bg-sunken" />
        )}
        <span className="flex min-w-0 flex-1 flex-col gap-4">
          <span className="truncate type-subhead-emphasized text-text-primary">{product.name}</span>
          <span className="type-caption-1 text-text-tertiary">
            {product.brand ? `${product.brand} · ` : ''}
            {formatKcal(product.per100g.kcal)} kcal per 100 g
          </span>
        </span>
      </button>
    </li>
  );
}

/**
 * Frame 7b, "Search — loading state". Typing shows skeleton rows for the latency a real
 * lookup would have, then the matches. In ingredient mode a match joins the dish draft and
 * the screen returns to it; otherwise it opens the product calculator.
 */
export function SearchScreen() {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get('mode') === 'ingredient' ? 'ingredient' : 'product';
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  // The query the results currently answer; while it lags the typed query, we are searching.
  const [settledQuery, setSettledQuery] = useState(searchParams.get('q') ?? '');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useAppNavigate();
  const goBack = useGoBack();
  const addIngredient = useCalculatorStore((state) => state.addIngredient);
  const touchRecent = useDiaryStore((state) => state.touchRecent);
  const recent = useDiaryStore((state) => state.recentProductIds);

  // The screen exists to be typed into, so focus lands in the field on arrival.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSettledQuery(query);
    }, SEARCH_LATENCY_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [query]);

  const isSearching = query.trim() !== '' && settledQuery !== query;

  const results = query.trim()
    ? searchProducts(query)
    : recent.flatMap((id) => findProduct(id) ?? []);
  const heading = query.trim()
    ? isSearching
      ? 'Searching…'
      : `${String(results.length)} ${results.length === 1 ? 'result' : 'results'}`
    : 'Recent';

  const select = (product: Product) => {
    touchRecent(product.id);
    if (mode === 'ingredient') {
      addIngredient(product.id);
      goBack();
      return;
    }
    navigate(`${routes.product}/${product.id}`, 'push', { replace: true });
  };

  return (
    <Screen bottomInset="none">
      <ScreenHeader title={mode === 'ingredient' ? 'Add ingredient' : 'Add food'} />
      <div className="flex flex-col gap-16 px-20 pt-8">
        <SearchInput
          ref={inputRef}
          label="Search foods and brands"
          placeholder="Search foods and brands"
          value={query}
          autoComplete="off"
          onChange={(event) => {
            setQuery(event.target.value);
            setSearchParams(event.target.value ? { mode, q: event.target.value } : { mode }, {
              replace: true,
            });
          }}
        />
        <p role="status" aria-live="polite" className="type-caption-1 text-text-tertiary uppercase">
          {heading}
        </p>
        <ul aria-busy={isSearching} aria-label="Results" className="flex flex-col gap-12">
          {isSearching
            ? Array.from({ length: SKELETON_ROWS }, (_, index) => <SkeletonRow key={index} />)
            : results.map((product) => (
                <ResultRow key={product.id} product={product} onSelect={select} />
              ))}
        </ul>
        {!isSearching && query.trim() && results.length === 0 && (
          <p className="type-subhead text-text-secondary">
            Nothing matches “{query.trim()}” yet. Try a shorter word.
          </p>
        )}
      </div>
    </Screen>
  );
}
