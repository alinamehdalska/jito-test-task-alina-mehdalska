import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router';

import { PHOTOS } from '@/data/photos';
import { findRecipe, type Recipe } from '@/data/recipes';
import { multiplyNutrition, percentOfGoal } from '@/domain/nutrition';
import { MACRO_ORDER } from '@/domain/types';
import { INGREDIENT_ICON } from '@/features/calculator/ingredient-icon';
import { MACRO_DOT_CLASS, MACRO_LABEL } from '@/features/diary/macro-styles';
import { MealPickerTrigger } from '@/features/diary/meal-picker';
import { remainingForDay } from '@/features/diary/selectors';
import { useDiaryStore } from '@/features/diary/store';
import { useLogEntry } from '@/features/diary/use-log-entry';
import { useToday } from '@/features/diary/use-today';
import { Screen } from '@/shared/chrome/screen';
import { StickyCta } from '@/shared/chrome/sticky-cta';
import { cn } from '@/shared/lib/cn';
import { formatGrams, formatKcal, formatServings } from '@/shared/lib/format';
import { useGoBack } from '@/shared/lib/use-app-navigate';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { Icon } from '@/shared/ui/icon';
import { IconButton } from '@/shared/ui/icon-button';
import { SectionTabs } from '@/shared/ui/section-tabs';
import { Stepper } from '@/shared/ui/stepper';

const TABS = [
  { id: 'ingredients', label: 'Ingredients' },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'instructions', label: 'Instructions' },
] as const;
type TabId = (typeof TABS)[number]['id'];
const TAB_PARAM = 'tab';
/** Half a serving is the most common override, so the stepper moves in halves. */
const SERVING_STEP = 0.5;
const MIN_SERVINGS = 0.5;
const MAX_SERVINGS = 8;

function readTab(value: string | null): TabId {
  return TABS.some((tab) => tab.id === value) ? (value as TabId) : 'ingredients';
}

function HeroHeader({
  recipe,
  isSaved,
  onSave,
}: {
  readonly recipe: Recipe;
  readonly isSaved: boolean;
  readonly onSave: () => void;
}) {
  const goBack = useGoBack();
  const hero = PHOTOS[recipe.photo].hero;
  return (
    <div className="relative h-(--screen-hero-photo-h) w-full">
      {hero && (
        <img src={hero} alt="" width={786} height={572} className="size-full object-cover" />
      )}
      {/* The only status bar that sits on a photograph: a white scrim solved for 4.5:1 over any image. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-(--screen-status-scrim-h) bg-linear-to-b from-bg-surface/74 via-bg-surface/62 via-42% to-transparent"
      />
      <div className="absolute inset-x-20 top-(--screen-top-inset) flex justify-between">
        <IconButton
          icon="caret-left"
          label="Back"
          onClick={goBack}
          className="size-40 bg-bg-surface shadow-xs"
        />
        <button
          type="button"
          aria-pressed={isSaved}
          aria-label="Save recipe"
          onClick={onSave}
          className="flex size-40 items-center justify-center rounded-full bg-bg-surface text-text-primary shadow-xs"
        >
          <Icon
            name="heart"
            weight={isSaved ? 'fill' : 'regular'}
            className={cn('size-20', isSaved && 'text-accent-primary')}
          />
        </button>
      </div>
    </div>
  );
}

/** Numbers lead: "130 kcal to spare after this serving", never "a little over". */
function FitInsight({ kcal, remaining }: { readonly kcal: number; readonly remaining: number }) {
  const fits = kcal <= remaining;
  return (
    <div
      className={cn(
        'flex items-center gap-12 rounded-16 px-16 py-12',
        fits ? 'bg-feedback-success-surface' : 'bg-feedback-warning-surface',
      )}
    >
      <span
        className={cn(
          'flex size-24 shrink-0 items-center justify-center rounded-full text-text-inverse',
          fits ? 'bg-feedback-success' : 'bg-feedback-warning',
        )}
      >
        <Icon name={fits ? 'check' : 'minus'} weight="fill" className="size-16" />
      </span>
      <span className="flex min-w-0 flex-col gap-2">
        <span
          className={cn(
            'type-subhead-emphasized',
            fits ? 'text-feedback-success' : 'text-text-primary',
          )}
        >
          {fits ? 'Fits your daily plan' : 'Over today’s plan'}
        </span>
        <span className="type-caption-1 text-text-secondary">
          {fits
            ? `${formatKcal(remaining - kcal)} kcal to spare after this serving.`
            : `${formatKcal(kcal - remaining)} kcal over what you have left today.`}
        </span>
      </span>
    </div>
  );
}

function IngredientsPanel({ recipe }: { readonly recipe: Recipe }) {
  return (
    <ul className="flex flex-col gap-2">
      {recipe.ingredients.map((ingredient) => (
        <li key={ingredient.name} className="flex h-control-button items-center gap-12">
          <span className="flex size-32 shrink-0 items-center justify-center rounded-full bg-bg-sunken text-text-secondary">
            <Icon name={INGREDIENT_ICON[ingredient.category]} className="size-16" />
          </span>
          <span className="min-w-0 flex-1 truncate type-body text-text-primary">
            {ingredient.name}
          </span>
          <span className="type-subhead text-text-secondary">{formatGrams(ingredient.grams)}</span>
        </li>
      ))}
    </ul>
  );
}

function NutritionPanel({ recipe }: { readonly recipe: Recipe }) {
  return (
    <div className="flex flex-col gap-20">
      <dl className="flex flex-col divide-y divide-border-subtle rounded-16 bg-bg-canvas px-16 py-4">
        {recipe.facts.map((fact) => (
          <div
            key={fact.label}
            className="flex min-h-control-button items-center justify-between py-2"
          >
            <dt className="type-subhead text-text-secondary">{fact.label}</dt>
            <dd className="type-subhead-emphasized text-text-primary">{fact.value}</dd>
          </div>
        ))}
      </dl>
      <p className="type-caption-1 text-text-secondary">
        Per serving. Values are estimated from ingredient data.
      </p>
    </div>
  );
}

function InstructionsPanel({ recipe }: { readonly recipe: Recipe }) {
  return (
    <div className="flex flex-col gap-20">
      <h2 className="type-title-3 text-text-primary">Instructions</h2>
      <ol className="flex flex-col gap-16">
        {recipe.steps.map((step, index) => (
          <li key={step.title} className="flex items-start gap-16">
            <span className="flex size-24 shrink-0 items-center justify-center rounded-full bg-accent-primary-muted type-caption-1-emphasized text-accent-primary-strong">
              {index + 1}
            </span>
            <span className="flex min-w-0 flex-col gap-4">
              <span className="type-subhead-emphasized text-text-primary">{step.title}</span>
              <span className="type-callout text-text-secondary">{step.body}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * Frames 5 / 5b / 5c, "Recipe Details". One route, three tab panels under one summary: the
 * hero, the fit insight and the macro row stay put while the tabs — sticky under the status
 * bar — swap only the panel, so the "does it fit" context never leaves the reader. The
 * insight and the CTA both follow the live diary.
 */
export function RecipeDetailsScreen() {
  const { slug } = useParams();
  const recipe = slug ? findRecipe(slug) : undefined;
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = readTab(searchParams.get(TAB_PARAM));
  const [servings, setServings] = useState(1);
  const [isSaved, setIsSaved] = useState(false);
  const today = useToday();
  const goal = useDiaryStore((state) => state.goal);
  const entries = useDiaryStore((state) => state.entries);
  const remaining = remainingForDay(goal, entries, today);
  const logEntry = useLogEntry();

  if (!recipe) {
    return (
      <Screen backdrop="surface" topInset>
        <div className="px-20 pt-4">
          <EmptyState
            icon="bowl-food"
            title="Recipe not found"
            body="This link points at a recipe the prototype does not have."
          />
        </div>
      </Screen>
    );
  }

  const setTab = (next: TabId) => {
    setSearchParams(next === 'ingredients' ? {} : { [TAB_PARAM]: next }, { replace: true });
  };
  const logged = multiplyNutrition(recipe.perServing, servings);
  const servingLabel = formatServings(servings);

  return (
    <Screen
      backdrop="surface"
      bottomInset="cta-recipe"
      topInset={false}
      chrome={
        <StickyCta fade="detail" header={<MealPickerTrigger variant="chip" />}>
          <Stepper
            label="Servings to log"
            value={servings}
            onChange={setServings}
            step={SERVING_STEP}
            min={MIN_SERVINGS}
            max={MAX_SERVINGS}
            variant="pill"
            formatValue={(value) => formatServings(value).split(' ')[0] ?? String(value)}
          />
          <Button
            size="lg"
            className="min-w-0 flex-1"
            onClick={() => {
              logEntry({
                name: recipe.name,
                nutrition: logged,
                amount: { value: servings, unit: 'serving' },
                source: 'recipe',
                photo: recipe.photo,
              });
            }}
          >
            Log {servingLabel} to Diary
          </Button>
        </StickyCta>
      }
    >
      <HeroHeader
        recipe={recipe}
        isSaved={isSaved}
        onSave={() => {
          setIsSaved((saved) => !saved);
        }}
      />

      <div className="-mt-24 flex flex-col gap-16 rounded-t-32 bg-bg-surface px-20 pt-20 pb-40">
        <h1 className="type-title-1 text-text-primary">{recipe.name}</h1>
        <div className="flex flex-wrap items-center gap-x-16 gap-y-8">
          <span className="flex items-center gap-8 type-subhead text-text-secondary">
            <Icon name="clock" className="size-16" />
            {recipe.minutes} min
          </span>
          <span className="flex items-center gap-8 type-subhead text-text-secondary">
            <Icon name="circle-half" className="size-16" />
            {recipe.servings} servings
          </span>
          <span className="flex items-baseline gap-8">
            <span className="type-subhead-emphasized text-text-primary">
              {formatKcal(recipe.perServing.kcal)} kcal
            </span>
            <span className="type-subhead text-text-secondary">per serving</span>
          </span>
        </div>
        <FitInsight kcal={recipe.perServing.kcal} remaining={remaining} />
        <dl className="flex items-center justify-between rounded-16 bg-bg-canvas px-16 py-12">
          {MACRO_ORDER.map((macro) => (
            <div key={macro} className="flex flex-col gap-2">
              <dd className="flex items-center gap-8 type-subhead-emphasized text-text-primary">
                <span
                  aria-hidden="true"
                  className={cn('size-8 rounded-full', MACRO_DOT_CLASS[macro])}
                />
                {formatGrams(recipe.perServing[macro])}
              </dd>
              <dt className="type-caption-2 text-text-secondary">
                {MACRO_LABEL[macro]} · {percentOfGoal(recipe.perServing[macro], goal[macro])}%
              </dt>
            </div>
          ))}
        </dl>

        {/* Sticky under the status bar: switching a tab swaps the panel, never the page. */}
        <div className="sticky top-(--screen-top-inset) z-10 -mx-20 bg-bg-surface px-20">
          <SectionTabs
            label="Recipe sections"
            tabs={TABS}
            active={tab}
            onChange={setTab}
            trailing={
              tab === 'ingredients' ? (
                <span className="type-caption-1 text-text-secondary">
                  {recipe.ingredients.length} items
                </span>
              ) : undefined
            }
          />
        </div>

        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === 'ingredients' && <IngredientsPanel recipe={recipe} />}
          {tab === 'nutrition' && <NutritionPanel recipe={recipe} />}
          {tab === 'instructions' && <InstructionsPanel recipe={recipe} />}
        </div>
      </div>
    </Screen>
  );
}
