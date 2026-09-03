import type { MacroKey } from '@/domain/types';

export const MACRO_LABEL: Readonly<Record<MacroKey, string>> = {
  carbs: 'Carbs',
  protein: 'Protein',
  fat: 'Fat',
};

/** Class names spelled out per macro so Tailwind can see them; the spine never changes. */
export const MACRO_DOT_CLASS: Readonly<Record<MacroKey, string>> = {
  carbs: 'bg-macro-carbs-indicator',
  protein: 'bg-macro-protein-indicator',
  fat: 'bg-macro-fat-indicator',
};
