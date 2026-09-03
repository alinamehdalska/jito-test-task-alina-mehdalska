import { create } from 'zustand';

import type { ProductId } from '@/data/products';

export interface DishIngredient {
  readonly productId: string;
  readonly grams: number;
}

interface DishDraft {
  readonly name: string;
  readonly ingredients: readonly DishIngredient[];
  readonly servings: number;
}

interface CalculatorState {
  readonly dish: DishDraft;
  readonly renameDish: (name: string) => void;
  readonly addIngredient: (productId: string, grams?: number) => void;
  readonly updateIngredient: (productId: string, grams: number) => void;
  readonly removeIngredient: (productId: string) => void;
  readonly setServings: (servings: number) => void;
  readonly resetDish: () => void;
}

const DEFAULT_INGREDIENT_GRAMS = 100;

/** Frame 3's dish, so the calculator is populated on first visit; cleared once it is saved. */
const SEED_DISH: DishDraft = {
  name: 'Chicken Quinoa Bowl',
  ingredients: [
    { productId: 'chicken-breast-cooked' satisfies ProductId, grams: 150 },
    { productId: 'quinoa-cooked' satisfies ProductId, grams: 100 },
    { productId: 'avocado' satisfies ProductId, grams: 50 },
    { productId: 'mixed-vegetables' satisfies ProductId, grams: 100 },
  ],
  servings: 2,
};

const EMPTY_DISH: DishDraft = { name: '', ingredients: [], servings: 1 };

export const useCalculatorStore = create<CalculatorState>()((set) => ({
  dish: SEED_DISH,
  renameDish: (name) => {
    set((state) => ({ dish: { ...state.dish, name } }));
  },
  addIngredient: (productId, grams = DEFAULT_INGREDIENT_GRAMS) => {
    set((state) => {
      const exists = state.dish.ingredients.some((item) => item.productId === productId);
      const ingredients = exists
        ? state.dish.ingredients.map((item) =>
            item.productId === productId ? { ...item, grams: item.grams + grams } : item,
          )
        : [...state.dish.ingredients, { productId, grams }];
      return { dish: { ...state.dish, ingredients } };
    });
  },
  updateIngredient: (productId, grams) => {
    set((state) => ({
      dish: {
        ...state.dish,
        ingredients: state.dish.ingredients.map((item) =>
          item.productId === productId ? { ...item, grams } : item,
        ),
      },
    }));
  },
  removeIngredient: (productId) => {
    set((state) => ({
      dish: {
        ...state.dish,
        ingredients: state.dish.ingredients.filter((item) => item.productId !== productId),
      },
    }));
  },
  setServings: (servings) => {
    set((state) => ({ dish: { ...state.dish, servings: Math.max(1, servings) } }));
  },
  resetDish: () => {
    set({ dish: EMPTY_DISH });
  },
}));
