import { useState } from 'react';
import { useParams } from 'react-router';

import { routes } from '@/app/routes';
import { PHOTOS } from '@/data/photos';
import { findProduct, requireProduct } from '@/data/products';
import { scaleNutrition } from '@/domain/nutrition';
import type { Product } from '@/domain/types';
import { CalculatorModeSwitch, SectionLabel } from '@/features/calculator/calculator-shell';
import { MacroBreakdown } from '@/features/calculator/macro-breakdown';
import { useDiaryStore } from '@/features/diary/store';
import { useLogEntry } from '@/features/diary/use-log-entry';
import { Screen } from '@/shared/chrome/screen';
import { ScreenHeader } from '@/shared/chrome/screen-header';
import { StickyCta } from '@/shared/chrome/sticky-cta';
import { formatKcal } from '@/shared/lib/format';
import { useAppNavigate } from '@/shared/lib/use-app-navigate';
import { Button } from '@/shared/ui/button';
import { Chip } from '@/shared/ui/chip';
import { Icon } from '@/shared/ui/icon';
import { SearchInput } from '@/shared/ui/search-input';
import { Stepper } from '@/shared/ui/stepper';

const PRESETS = [100, 150, 200] as const;
const DEFAULT_GRAMS = 100;
const STEP_GRAMS = 10;
const MIN_GRAMS = 10;
const MAX_GRAMS = 2000;
const AMOUNT_INPUT_ID = 'amount-input';

function ServingPresets({
  grams,
  onSelect,
}: {
  readonly grams: number;
  readonly onSelect: (grams: number) => void;
}) {
  const isCustom = !PRESETS.some((preset) => preset === grams);
  return (
    <div
      role="radiogroup"
      aria-label="Serving size"
      className="flex min-h-control-button items-center gap-8"
    >
      {PRESETS.map((preset) => (
        <Chip
          key={preset}
          role="radio"
          aria-checked={preset === grams}
          selected={preset === grams}
          onClick={() => {
            onSelect(preset);
          }}
        >
          {preset} g
        </Chip>
      ))}
      <Chip
        role="radio"
        aria-checked={isCustom}
        selected={isCustom}
        onClick={() => {
          document.getElementById(AMOUNT_INPUT_ID)?.focus();
        }}
      >
        Custom
      </Chip>
    </div>
  );
}

function ProductResultCard({ product }: { readonly product: Product }) {
  const isFavourite = useDiaryStore((state) => state.favouriteProductIds.includes(product.id));
  const toggleFavourite = useDiaryStore((state) => state.toggleFavourite);
  const photo = product.photo ? PHOTOS[product.photo].product : undefined;
  return (
    <article className="flex items-center gap-12 rounded-20 bg-bg-surface p-16 shadow-xs">
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
      <button
        type="button"
        aria-pressed={isFavourite}
        aria-label="Favourite"
        onClick={() => {
          toggleFavourite(product.id);
        }}
        className="-mr-12 flex size-control-button shrink-0 items-center justify-center rounded-full text-text-secondary"
      >
        <Icon
          name="star"
          weight={isFavourite ? 'fill' : 'regular'}
          className={isFavourite ? 'size-20 text-accent-primary' : 'size-20'}
        />
      </button>
    </article>
  );
}

/**
 * Frame 2, "Calculator — Product". Presets cover the common servings in one tap; the
 * stepper with a typed value covers everything else, which is what this screen exists to capture.
 */
export function ProductScreen() {
  const { productId } = useParams();
  const recent = useDiaryStore((state) => state.recentProductIds);
  const favourites = useDiaryStore((state) => state.favouriteProductIds);
  const touchRecent = useDiaryStore((state) => state.touchRecent);
  const navigate = useAppNavigate();
  const logEntry = useLogEntry();

  const product =
    (productId ? findProduct(productId) : undefined) ?? requireProduct('greek-yogurt-2');
  const [grams, setGrams] = useState<number>(DEFAULT_GRAMS);
  const serving = scaleNutrition(product.per100g, grams);

  const add = () => {
    touchRecent(product.id);
    logEntry({ name: product.name, nutrition: serving, source: 'product', photo: product.photo });
  };

  return (
    <Screen
      bottomInset="cta-product"
      chrome={
        <StickyCta
          fade="nav"
          header={
            <div className="flex items-center justify-between">
              <span className="flex flex-col gap-2">
                <span className="type-caption-1 text-text-tertiary uppercase">Total</span>
                <span className="type-subhead text-text-secondary">per {grams} g serving</span>
              </span>
              <span className="type-metric-card text-text-primary">
                {formatKcal(serving.kcal)} kcal
              </span>
            </div>
          }
        >
          <Button size="lg" fullWidth onClick={add}>
            Add {formatKcal(serving.kcal)} kcal to Diary
          </Button>
        </StickyCta>
      }
    >
      <ScreenHeader title="Add food" closable />
      <div className="flex flex-col gap-12 px-20 pt-8">
        <CalculatorModeSwitch />

        <SearchInput
          label="Search foods and brands"
          placeholder="Search foods and brands"
          readOnly
          value={product.name}
          onFocus={() => {
            navigate(routes.search, 'push');
          }}
          trailing={
            <button
              type="button"
              aria-label="Scan a barcode"
              className="flex size-control-button shrink-0 items-center justify-center rounded-full text-accent-primary"
            >
              <Icon name="scan" className="size-20" />
            </button>
          }
        />

        <div className="flex flex-col gap-8">
          <SectionLabel>Recent</SectionLabel>
          <div className="flex min-h-control-button items-center gap-12 overflow-x-auto">
            {recent.map((id) => {
              const item = findProduct(id);
              if (!item) return null;
              return (
                <Chip
                  key={id}
                  iconLeading={favourites.includes(id) ? 'star' : undefined}
                  onClick={() => {
                    navigate(`${routes.product}/${id}`, 'none', { replace: true });
                  }}
                >
                  {item.name.split(',')[0]}
                </Chip>
              );
            })}
          </div>
        </div>

        <ProductResultCard product={product} />

        <div className="flex flex-col gap-12">
          <SectionLabel>Serving size</SectionLabel>
          <ServingPresets grams={grams} onSelect={setGrams} />
          <div className="flex min-h-control-cta items-center justify-between rounded-16 border border-border-subtle bg-bg-surface py-4 pr-12 pl-16">
            <span className="type-subhead text-text-secondary">Amount</span>
            <Stepper
              label="Amount in grams"
              inputId={AMOUNT_INPUT_ID}
              value={grams}
              onChange={setGrams}
              step={STEP_GRAMS}
              min={MIN_GRAMS}
              max={MAX_GRAMS}
              unit="g"
              editable
            />
          </div>
        </div>

        <MacroBreakdown nutrition={serving} />
      </div>
    </Screen>
  );
}
