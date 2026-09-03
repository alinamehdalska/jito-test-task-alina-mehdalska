import type { FoodCategory } from '@/domain/types';
import type { IconName } from '@/shared/ui/icon-glyphs';

/** The Figma ingredient wells use four glyphs; every food category maps onto one of them. */
export const INGREDIENT_ICON: Readonly<Record<FoodCategory, IconName>> = {
  protein: 'fish',
  grain: 'grains',
  vegetable: 'leaf',
  fruit: 'leaf',
  fat: 'avocado',
  dairy: 'bowl-food',
  other: 'bowl-food',
};
