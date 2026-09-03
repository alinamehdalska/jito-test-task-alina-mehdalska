import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import betterTailwindcss from 'eslint-plugin-better-tailwindcss';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// jsx-a11y ships its strict preset with several rules at "warn"; the house rule
// (~/.claude/react.md) is that accessibility findings are errors, not suggestions.
const a11yAsErrors = Object.fromEntries(
  Object.keys(jsxA11y.flatConfigs.strict.rules).map((rule) => [rule, 'error']),
);

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'playwright-report', 'test-results']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.strict,
      betterTailwindcss.configs['recommended-error'],
    ],
    plugins: { 'simple-import-sort': simpleImportSort },
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: { version: 'detect' },
      'better-tailwindcss': { entryPoint: 'src/styles/app.css' },
    },
    rules: {
      ...a11yAsErrors,
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'react/no-array-index-key': 'error',
      'react/prop-types': 'off',
      'react/self-closing-comp': 'error',
      // Prettier's tailwind plugin owns class order and wrapping.
      'better-tailwindcss/enforce-consistent-class-order': 'off',
      'better-tailwindcss/enforce-consistent-line-wrapping': 'off',
      // The design contract: components consume semantic tokens only, and every
      // value comes from tokens.json. Arbitrary values and primitive variables
      // are the two ways to bypass that, so both are lint errors.
      'better-tailwindcss/no-restricted-classes': [
        'error',
        {
          restrict: [
            {
              pattern: '\\[',
              message:
                'Arbitrary values bypass tokens.json — use a semantic token or a --screen-* layout variable.',
            },
            {
              pattern: '--plate-color-',
              message: 'Primitive colours are scoped out of components — consume a semantic token.',
            },
          ],
        },
      ],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/no-unnecessary-condition': [
        'error',
        { allowConstantLoopConditions: true },
      ],
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', 'src/shared/test/**', 'e2e/**', 'scripts/**'],
    rules: {
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
]);
