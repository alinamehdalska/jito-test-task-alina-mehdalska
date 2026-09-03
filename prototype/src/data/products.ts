import type { Product } from '@/domain/types';

/**
 * A small food database with per-100 g label values (USDA / manufacturer labels), enough for
 * search, the recent chips, the dish calculator and the recipe ingredient lists.
 */
export const PRODUCTS = [
  {
    id: 'greek-yogurt-2',
    name: 'Greek Yogurt, 2%',
    brand: 'Fage',
    category: 'dairy',
    per100g: { kcal: 73, protein: 10, carbs: 3.6, fat: 2 },
    photo: 'greek-yogurt',
  },
  {
    id: 'banana',
    name: 'Banana',
    category: 'fruit',
    per100g: { kcal: 89, protein: 1.1, carbs: 22.8, fat: 0.3 },
  },
  {
    id: 'oat-milk',
    name: 'Oat milk',
    brand: 'Oatly',
    category: 'dairy',
    per100g: { kcal: 46, protein: 1, carbs: 6.7, fat: 1.5 },
  },
  {
    id: 'chicken-breast-cooked',
    name: 'Chicken breast, cooked',
    category: 'protein',
    per100g: { kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
  },
  {
    id: 'chicken-breast-raw',
    name: 'Chicken breast, raw',
    category: 'protein',
    per100g: { kcal: 120, protein: 22.5, carbs: 0, fat: 2.6 },
  },
  {
    id: 'chicken-thigh',
    name: 'Chicken thigh, roasted',
    category: 'protein',
    per100g: { kcal: 209, protein: 26, carbs: 0, fat: 11 },
  },
  {
    id: 'quinoa-cooked',
    name: 'Quinoa, cooked',
    category: 'grain',
    per100g: { kcal: 120, protein: 4.4, carbs: 21.3, fat: 1.9 },
  },
  {
    id: 'avocado',
    name: 'Avocado',
    category: 'fat',
    per100g: { kcal: 160, protein: 2, carbs: 8.5, fat: 14.7 },
  },
  {
    id: 'mixed-vegetables',
    name: 'Mixed vegetables, steamed',
    category: 'vegetable',
    per100g: { kcal: 40, protein: 2, carbs: 8, fat: 0.3 },
  },
  {
    id: 'brown-rice-cooked',
    name: 'Brown rice, cooked',
    category: 'grain',
    per100g: { kcal: 112, protein: 2.3, carbs: 23.5, fat: 0.8 },
  },
  {
    id: 'salmon-fillet',
    name: 'Salmon fillet',
    category: 'protein',
    per100g: { kcal: 208, protein: 20, carbs: 0, fat: 13 },
  },
  {
    id: 'baby-spinach',
    name: 'Baby spinach',
    category: 'vegetable',
    per100g: { kcal: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  },
  {
    id: 'lemon-juice',
    name: 'Lemon juice',
    category: 'fruit',
    per100g: { kcal: 22, protein: 0.4, carbs: 6.9, fat: 0.2 },
  },
  {
    id: 'trail-mix',
    name: 'Trail mix',
    category: 'other',
    per100g: { kcal: 462, protein: 13, carbs: 45, fat: 30 },
  },
  {
    id: 'egg-boiled',
    name: 'Egg, boiled',
    category: 'protein',
    per100g: { kcal: 155, protein: 13, carbs: 1.1, fat: 11 },
  },
  {
    id: 'chickpeas-cooked',
    name: 'Chickpeas, cooked',
    category: 'grain',
    per100g: { kcal: 164, protein: 8.9, carbs: 27.4, fat: 2.6 },
  },
  {
    id: 'tuna-steak',
    name: 'Tuna steak',
    category: 'protein',
    per100g: { kcal: 132, protein: 28, carbs: 0, fat: 1.3 },
  },
  {
    id: 'cottage-cheese',
    name: 'Cottage cheese',
    category: 'dairy',
    per100g: { kcal: 98, protein: 11, carbs: 3.4, fat: 4.3 },
  },
  {
    id: 'almonds',
    name: 'Almonds',
    category: 'other',
    per100g: { kcal: 579, protein: 21, carbs: 22, fat: 50 },
  },
  {
    id: 'rolled-oats',
    name: 'Oats, rolled',
    category: 'grain',
    per100g: { kcal: 379, protein: 13, carbs: 67, fat: 6.5 },
  },
] as const satisfies readonly Product[];

export type ProductId = (typeof PRODUCTS)[number]['id'];

/** The same list without literal types, for lookups and search. */
const ALL_PRODUCTS: readonly Product[] = PRODUCTS;

const BY_ID: ReadonlyMap<string, Product> = new Map(
  ALL_PRODUCTS.map((product) => [product.id, product]),
);

export function findProduct(id: string): Product | undefined {
  return BY_ID.get(id);
}

export function requireProduct(id: ProductId): Product {
  const product = BY_ID.get(id);
  if (!product) throw new Error(`Unknown product ${id}`);
  return product;
}

/** Case-insensitive match on name or brand, in database order. */
export function searchProducts(query: string): Product[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  return ALL_PRODUCTS.filter(
    (product) =>
      product.name.toLowerCase().includes(needle) ||
      (product.brand?.toLowerCase().includes(needle) ?? false),
  );
}
