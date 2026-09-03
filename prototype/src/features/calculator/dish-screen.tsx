import { routes } from '@/app/routes';
import { findProduct } from '@/data/products';
import { perServing, scaleNutrition, sumNutrition } from '@/domain/nutrition';
import { MACRO_ORDER } from '@/domain/types';
import { CalculatorModeSwitch, SectionLabel } from '@/features/calculator/calculator-shell';
import { INGREDIENT_ICON } from '@/features/calculator/ingredient-icon';
import { useCalculatorStore } from '@/features/calculator/store';
import { MACRO_DOT_CLASS, MACRO_LABEL } from '@/features/diary/macro-styles';
import { useLogEntry } from '@/features/diary/use-log-entry';
import { Screen } from '@/shared/chrome/screen';
import { ScreenHeader } from '@/shared/chrome/screen-header';
import { StickyCta } from '@/shared/chrome/sticky-cta';
import { cn } from '@/shared/lib/cn';
import { formatGrams, formatKcal } from '@/shared/lib/format';
import { useAppNavigate } from '@/shared/lib/use-app-navigate';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { IconButton } from '@/shared/ui/icon-button';
import { Stepper } from '@/shared/ui/stepper';

const MAX_SERVINGS = 12;

/**
 * Frame 3, "Dish Calculator" — the half of User Story 1 the previous design left unbuilt.
 * Per-serving maths is shown explicitly rather than left to the user.
 */
export function DishScreen() {
  const dish = useCalculatorStore((state) => state.dish);
  const renameDish = useCalculatorStore((state) => state.renameDish);
  const removeIngredient = useCalculatorStore((state) => state.removeIngredient);
  const setServings = useCalculatorStore((state) => state.setServings);
  const resetDish = useCalculatorStore((state) => state.resetDish);
  const navigate = useAppNavigate();
  const logEntry = useLogEntry();

  const rows = dish.ingredients.flatMap((item) => {
    const product = findProduct(item.productId);
    return product
      ? [{ ...item, product, nutrition: scaleNutrition(product.per100g, item.grams) }]
      : [];
  });
  const total = sumNutrition(rows.map((row) => row.nutrition));
  const serving = perServing(total, dish.servings);
  const canSave = rows.length > 0 && dish.name.trim().length > 0;

  const addIngredient = () => {
    navigate(`${routes.search}?mode=ingredient`, 'push');
  };

  const save = () => {
    logEntry({ name: dish.name.trim(), nutrition: serving, source: 'dish' });
    resetDish();
  };

  return (
    <Screen
      bottomInset="cta-dish"
      chrome={
        <StickyCta
          fade="nav"
          header={
            <div className="flex flex-col gap-12 rounded-20 bg-bg-surface px-16 py-8 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="flex flex-col gap-2">
                  <span className="type-caption-1 text-text-tertiary uppercase">Total dish</span>
                  <span className="type-subhead text-text-secondary">
                    {formatKcal(total.kcal)} kcal · {dish.servings}{' '}
                    {dish.servings === 1 ? 'serving' : 'servings'}
                  </span>
                </span>
                <span className="flex flex-col items-end">
                  <span className="type-metric-card text-text-primary">
                    {formatKcal(serving.kcal)}
                  </span>
                  <span className="type-caption-2 text-text-tertiary">kcal per serving</span>
                </span>
              </div>
              <dl className="flex items-center justify-between">
                {MACRO_ORDER.map((macro) => (
                  <div key={macro} className="flex flex-col">
                    <dd className="flex items-center gap-8 type-caption-1-emphasized text-text-primary">
                      <span
                        aria-hidden="true"
                        className={cn('size-8 rounded-full', MACRO_DOT_CLASS[macro])}
                      />
                      {formatGrams(total[macro])}
                    </dd>
                    <dt className="pl-16 type-caption-2 text-text-tertiary">
                      {MACRO_LABEL[macro]}
                    </dt>
                  </div>
                ))}
              </dl>
            </div>
          }
        >
          <Button size="lg" fullWidth onClick={save} disabled={!canSave}>
            Save dish to Diary
          </Button>
        </StickyCta>
      }
    >
      <ScreenHeader title="Create a dish" closable />
      <div className="flex flex-col gap-12 px-20 pt-8">
        <CalculatorModeSwitch />

        <div className="flex flex-col gap-8">
          <SectionLabel>Dish name</SectionLabel>
          <input
            id="dish-name"
            aria-label="Dish name"
            type="text"
            value={dish.name}
            placeholder="Name your dish"
            onChange={(event) => {
              renameDish(event.target.value);
            }}
            className="h-control-cta w-full rounded-16 border border-border-subtle bg-bg-surface px-16 type-headline text-text-primary outline-none placeholder:text-text-tertiary focus-visible:border-2 focus-visible:border-border-focus"
          />
        </div>

        <div className="flex flex-col gap-12">
          <SectionLabel
            trailing={
              <button
                type="button"
                onClick={addIngredient}
                className="-my-12 flex h-control-button items-center gap-4 type-caption-1-emphasized text-accent-primary-strong"
              >
                <Icon name="plus" className="size-16" />
                Add
              </button>
            }
          >
            Ingredients ({rows.length})
          </SectionLabel>
          {rows.length > 0 && (
            <ul className="flex flex-col divide-y divide-border-subtle rounded-20 bg-bg-surface px-16 py-8 shadow-xs">
              {rows.map((row) => (
                <li key={row.productId} className="flex min-h-control-cta items-center gap-12 py-4">
                  <span className="flex size-32 shrink-0 items-center justify-center rounded-full bg-bg-sunken text-text-secondary">
                    <Icon name={INGREDIENT_ICON[row.product.category]} className="size-16" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-2">
                    <span className="truncate type-subhead text-text-primary">
                      {row.product.name}
                    </span>
                    <span className="type-caption-1 text-text-tertiary">
                      {formatGrams(row.grams)}
                    </span>
                  </span>
                  <span className="type-subhead text-text-secondary">
                    {formatKcal(row.nutrition.kcal)} kcal
                  </span>
                  <IconButton
                    icon="x"
                    label={`Remove ${row.product.name}`}
                    className="-mr-12 text-text-tertiary"
                    onClick={() => {
                      removeIngredient(row.productId);
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={addIngredient}
            className="flex h-control-button w-full items-center justify-center gap-8 rounded-16 border border-dashed border-border-interactive bg-bg-surface type-subhead-emphasized text-accent-primary-strong"
          >
            <Icon name="plus" className="size-20" />
            Add ingredient
          </button>
        </div>

        <div className="flex min-h-control-cta items-center justify-between rounded-16 bg-bg-surface py-4 pr-12 pl-16 shadow-xs">
          <span className="type-subhead-emphasized text-text-primary">Servings</span>
          <Stepper
            label="Servings"
            value={dish.servings}
            onChange={setServings}
            min={1}
            max={MAX_SERVINGS}
          />
        </div>
      </div>
    </Screen>
  );
}
