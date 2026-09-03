import type { FoodCategory, Nutrition, PhotoKey } from '@/domain/types';

export type RecipeTag = 'vegetarian' | 'quick' | 'high-protein' | 'low-carb';

export interface RecipeIngredient {
  readonly name: string;
  readonly grams: number;
  readonly category: FoodCategory;
}

export interface NutritionFact {
  readonly label: string;
  readonly value: string;
}

export interface RecipeStep {
  readonly title: string;
  readonly body: string;
}

export interface Recipe {
  readonly slug: string;
  readonly name: string;
  readonly photo: PhotoKey;
  readonly minutes: number;
  readonly servings: number;
  readonly perServing: Nutrition;
  readonly tags: readonly RecipeTag[];
  readonly ingredients: readonly RecipeIngredient[];
  /** The nine-row per-serving table of frame 5b. */
  readonly facts: readonly NutritionFact[];
  readonly steps: readonly RecipeStep[];
}

/**
 * The four recipes on the Discovery frame. In Figma every card resolves to the one detail
 * screen that exists; here each recipe is complete, so any card can be cooked from.
 */
export const RECIPES: readonly Recipe[] = [
  {
    slug: 'lemon-herb-salmon-bowl',
    name: 'Lemon Herb Salmon Bowl',
    photo: 'salmon-bowl',
    minutes: 15,
    servings: 2,
    perServing: { kcal: 480, protein: 34, carbs: 42, fat: 18 },
    tags: ['quick'],
    ingredients: [
      { name: 'Salmon fillet', grams: 140, category: 'protein' },
      { name: 'Brown rice', grams: 80, category: 'grain' },
      { name: 'Baby spinach', grams: 60, category: 'vegetable' },
      { name: 'Avocado', grams: 50, category: 'fat' },
      { name: 'Lemon juice', grams: 10, category: 'fruit' },
    ],
    facts: [
      { label: 'Calories', value: '480 kcal' },
      { label: 'Protein', value: '34 g' },
      { label: 'Carbohydrates', value: '42 g' },
      { label: 'Sugars', value: '6 g' },
      { label: 'Fat', value: '18 g' },
      { label: 'Saturated fat', value: '3.5 g' },
      { label: 'Fibre', value: '6 g' },
      { label: 'Sodium', value: '320 mg' },
      { label: 'Cholesterol', value: '65 mg' },
    ],
    steps: [
      {
        title: 'Cook the rice',
        body: 'Cook brown rice according to package instructions, then set aside to cool slightly.',
      },
      {
        title: 'Prepare the salmon',
        body: 'Season the salmon with lemon, herbs, salt and pepper. Sear 3–4 minutes per side.',
      },
      {
        title: 'Prep the vegetables',
        body: 'Halve and slice the avocado, then rinse the spinach and pat it dry.',
      },
      {
        title: 'Assemble the bowl',
        body: 'Spoon the rice into bowls, then top with spinach, salmon and avocado.',
      },
      {
        title: 'Finish and serve',
        body: 'Squeeze the lemon juice over the bowl, season to taste and serve warm.',
      },
    ],
  },
  {
    slug: 'miso-rice-egg-bowl',
    name: 'Miso Rice & Egg Bowl',
    photo: 'miso-bowl',
    minutes: 20,
    servings: 2,
    perServing: { kcal: 395, protein: 22, carbs: 48, fat: 13 },
    tags: ['vegetarian', 'quick'],
    ingredients: [
      { name: 'Brown rice', grams: 120, category: 'grain' },
      { name: 'Eggs, soft-boiled', grams: 100, category: 'protein' },
      { name: 'Mushrooms', grams: 80, category: 'vegetable' },
      { name: 'Cucumber', grams: 60, category: 'vegetable' },
      { name: 'Miso paste', grams: 15, category: 'other' },
      { name: 'Sesame oil', grams: 5, category: 'fat' },
    ],
    facts: [
      { label: 'Calories', value: '395 kcal' },
      { label: 'Protein', value: '22 g' },
      { label: 'Carbohydrates', value: '48 g' },
      { label: 'Sugars', value: '5 g' },
      { label: 'Fat', value: '13 g' },
      { label: 'Saturated fat', value: '3 g' },
      { label: 'Fibre', value: '5 g' },
      { label: 'Sodium', value: '690 mg' },
      { label: 'Cholesterol', value: '370 mg' },
    ],
    steps: [
      {
        title: 'Cook the rice',
        body: 'Cook brown rice according to package instructions and keep it warm.',
      },
      {
        title: 'Boil the eggs',
        body: 'Lower the eggs into simmering water for 6½ minutes, then cool them in cold water and peel.',
      },
      {
        title: 'Sauté the mushrooms',
        body: 'Fry the mushrooms in the sesame oil until golden, then stir the miso through with a splash of water.',
      },
      { title: 'Slice the cucumber', body: 'Cut the cucumber into thin half-moons.' },
      {
        title: 'Assemble and serve',
        body: 'Divide the rice between bowls, add the mushrooms, cucumber and halved eggs, and finish with a pinch of chilli.',
      },
    ],
  },
  {
    slug: 'chickpea-shakshuka',
    name: 'Chickpea Shakshuka',
    photo: 'shakshuka',
    minutes: 25,
    servings: 2,
    perServing: { kcal: 520, protein: 24, carbs: 52, fat: 22 },
    tags: ['vegetarian', 'quick'],
    ingredients: [
      { name: 'Chickpeas, cooked', grams: 150, category: 'grain' },
      { name: 'Eggs', grams: 100, category: 'protein' },
      { name: 'Chopped tomatoes', grams: 200, category: 'vegetable' },
      { name: 'Red pepper', grams: 80, category: 'vegetable' },
      { name: 'Onion', grams: 60, category: 'vegetable' },
      { name: 'Olive oil', grams: 10, category: 'fat' },
      { name: 'Flatbread', grams: 60, category: 'grain' },
    ],
    facts: [
      { label: 'Calories', value: '520 kcal' },
      { label: 'Protein', value: '24 g' },
      { label: 'Carbohydrates', value: '52 g' },
      { label: 'Sugars', value: '11 g' },
      { label: 'Fat', value: '22 g' },
      { label: 'Saturated fat', value: '4.5 g' },
      { label: 'Fibre', value: '12 g' },
      { label: 'Sodium', value: '780 mg' },
      { label: 'Cholesterol', value: '370 mg' },
    ],
    steps: [
      {
        title: 'Soften the base',
        body: 'Sweat the onion and red pepper in olive oil over a medium heat for 6–8 minutes.',
      },
      {
        title: 'Build the sauce',
        body: 'Add the tomatoes, cumin and paprika; simmer for 10 minutes until thick.',
      },
      { title: 'Add the chickpeas', body: 'Stir the chickpeas through and season to taste.' },
      {
        title: 'Poach the eggs',
        body: 'Make two wells in the sauce, crack in the eggs, cover and cook 5–6 minutes until the whites set.',
      },
      {
        title: 'Finish and serve',
        body: 'Scatter over coriander and serve straight from the pan with warm flatbread.',
      },
    ],
  },
  {
    slug: 'seared-tuna-nicoise',
    name: 'Seared Tuna Niçoise',
    photo: 'tuna-nicoise',
    minutes: 18,
    servings: 2,
    perServing: { kcal: 445, protein: 40, carbs: 24, fat: 20 },
    tags: ['high-protein', 'low-carb', 'quick'],
    ingredients: [
      { name: 'Tuna steak', grams: 150, category: 'protein' },
      { name: 'Mixed leaves', grams: 80, category: 'vegetable' },
      { name: 'Cherry tomatoes', grams: 80, category: 'vegetable' },
      { name: 'Green beans', grams: 70, category: 'vegetable' },
      { name: 'Orange segments', grams: 60, category: 'fruit' },
      { name: 'Olive oil', grams: 10, category: 'fat' },
    ],
    facts: [
      { label: 'Calories', value: '445 kcal' },
      { label: 'Protein', value: '40 g' },
      { label: 'Carbohydrates', value: '24 g' },
      { label: 'Sugars', value: '9 g' },
      { label: 'Fat', value: '20 g' },
      { label: 'Saturated fat', value: '3.5 g' },
      { label: 'Fibre', value: '6 g' },
      { label: 'Sodium', value: '410 mg' },
      { label: 'Cholesterol', value: '60 mg' },
    ],
    steps: [
      {
        title: 'Blanch the beans',
        body: 'Boil the green beans for 3 minutes, then refresh them in cold water.',
      },
      {
        title: 'Sear the tuna',
        body: 'Brush the tuna with oil, season, and sear in a very hot pan for 1–2 minutes per side. Rest, then slice.',
      },
      {
        title: 'Dress the leaves',
        body: 'Whisk the remaining oil with a little orange juice and mustard; toss with the leaves.',
      },
      {
        title: 'Assemble the plate',
        body: 'Arrange the leaves, beans, tomatoes and orange segments, then lay the tuna on top.',
      },
      {
        title: 'Serve',
        body: 'Finish with cracked pepper and serve immediately, while the tuna is still pink.',
      },
    ],
  },
];

export function findRecipe(slug: string): Recipe | undefined {
  return RECIPES.find((recipe) => recipe.slug === slug);
}
