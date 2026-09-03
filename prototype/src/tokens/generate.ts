/**
 * tokens.json → CSS for Tailwind v4.
 *
 * One pure function, no I/O. The output enforces the design contract from
 * design-system.md §1 in the only way CSS can:
 *
 * - every token becomes a `--plate-*` custom property on `:root`;
 * - only the layers a component is allowed to consume are re-exported inside
 *   `@theme inline`, so Tailwind mints utilities for semantic colours, the
 *   spacing/radius scales, shadows, fonts and control sizes — and for nothing
 *   else. Primitive colours get no utility, which is what scoping them `[]` in
 *   Figma achieves for the pickers there;
 * - the 15 text styles become `type-*` utilities named exactly like the Figma
 *   styles, so `Title 1` and `type-title-1` are the same decision;
 * - `theme.dark` is emitted under `[data-theme="dark"]` but nothing switches it
 *   on: the screens were designed in Light and the aurora/scrims/fades are
 *   authored for it.
 */

import {
  aliasTarget,
  dottedPath,
  flattenTokens,
  type FlatToken,
  indexTokens,
  isTokenGroup,
  isTokenLeaf,
  resolveToken,
  TokenError,
  type TokenGroup,
} from './dtcg.ts';

export interface GenerateOptions {
  /** CSS font stacks keyed by the DTCG `fontFamily` value, e.g. `"SF Pro"`. */
  readonly fontStacks: Readonly<Record<string, string>>;
}

/**
 * SF Pro is Apple-licensed and not distributable as a webfont, so the stacks
 * ask the platform for it first and fall back to self-hosted Inter / Nunito.
 * `ui-rounded` resolves to SF Pro Rounded in Safari only.
 */
export const FONT_STACKS: Readonly<Record<string, string>> = {
  'SF Pro':
    '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Inter Variable", system-ui, sans-serif',
  'SF Pro Rounded':
    'ui-rounded, "SF Pro Rounded", "Nunito Variable", -apple-system, system-ui, sans-serif',
};

interface ParsedTokens {
  readonly primitive: readonly FlatToken[];
  readonly semantic: readonly FlatToken[];
  readonly typography: readonly FlatToken[];
  readonly shadow: readonly FlatToken[];
  readonly motion: readonly FlatToken[];
  readonly dark: readonly { readonly key: string; readonly token: FlatToken }[];
  readonly index: ReadonlyMap<string, FlatToken>;
}

interface ShadowLayer {
  readonly color: string;
  readonly offsetX: string;
  readonly offsetY: string;
  readonly blur: string;
  readonly spread: string;
  readonly alpha: number;
}

interface TypographyValue {
  readonly fontFamily: string;
  readonly fontSize: string;
  readonly fontWeight: unknown;
  readonly lineHeight: string;
  readonly letterSpacing: string;
}

const ROOT_GROUPS = ['primitive', 'semantic', 'typography', 'shadow', 'theme'] as const;

/** Tailwind namespaces wiped before ours go in, so no default palette/scale survives. */
const THEME_RESETS = [
  'color',
  'spacing',
  'radius',
  'shadow',
  'font',
  'font-weight',
  'text',
  'leading',
  'tracking',
  'blur',
] as const;

function requireGroup(root: TokenGroup, key: string): TokenGroup {
  const node = root[key];
  if (!isTokenGroup(node)) throw new TokenError(`tokens.json has no "${key}" group`);
  return node;
}

export function parseTokens(input: unknown): ParsedTokens {
  if (!isTokenGroup(input)) throw new TokenError('tokens.json root must be an object');
  for (const key of ROOT_GROUPS) requireGroup(input, key);

  const primitive = flattenTokens(requireGroup(input, 'primitive'), ['primitive']);
  const semantic = flattenTokens(requireGroup(input, 'semantic'), ['semantic']);
  const typography = flattenTokens(requireGroup(input, 'typography'), ['typography']);
  const shadow = flattenTokens(requireGroup(input, 'shadow'), ['shadow']);
  const index = indexTokens([...primitive, ...semantic, ...typography, ...shadow]);

  // Every alias must land on a literal — this is the "no dangling alias" check
  // from the repo's definition of done, run on every build and test.
  for (const token of index.values()) {
    if (token.type === 'typography') continue;
    resolveToken(token, index);
  }

  const darkGroup = requireGroup(requireGroup(input, 'theme'), 'dark');
  const dark = Object.entries(darkGroup)
    .filter(([key]) => !key.startsWith('$'))
    .map(([key, node]) => {
      if (!isTokenLeaf(node)) throw new TokenError(`theme.dark.${key} is not a token`);
      if (!index.has(`semantic.${key}`)) {
        throw new TokenError(`theme.dark.${key} overrides a semantic token that does not exist`);
      }
      const token: FlatToken = {
        path: ['theme', 'dark', key],
        type: node.$type,
        value: node.$value,
        description: node.$description,
      };
      resolveToken(token, index);
      return { key, token };
    });

  const motion = primitive.filter((token) => token.path[1] === 'motion');
  return { primitive, semantic, typography, shadow, motion, dark, index };
}

/** `primitive.color.coral.400` → `--plate-color-coral-400`; `semantic.text.primary` → `--plate-text-primary`. */
export function cssVariableName(path: readonly string[]): string {
  const [head, ...rest] = path;
  const segments = head === 'primitive' || head === 'semantic' ? rest : path;
  return `--plate-${segments.join('-')}`;
}

function hexToRgbChannels(hex: string): string {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match?.[1]) throw new TokenError(`shadow colour ${hex} is not a 6-digit hex`);
  const value = Number.parseInt(match[1], 16);
  return `${(value >> 16) & 0xff} ${(value >> 8) & 0xff} ${value & 0xff}`;
}

function isShadowLayer(layer: unknown): layer is ShadowLayer {
  return (
    typeof layer === 'object' &&
    layer !== null &&
    ['color', 'offsetX', 'offsetY', 'blur', 'spread'].every(
      (key) => typeof (layer as Record<string, unknown>)[key] === 'string',
    ) &&
    typeof (layer as Record<string, unknown>).alpha === 'number'
  );
}

function serializeShadow(token: FlatToken): string {
  if (!Array.isArray(token.value) || !token.value.every(isShadowLayer)) {
    throw new TokenError(`${dottedPath(token.path)} must be an array of shadow layers`);
  }
  return token.value
    .map(
      (layer) =>
        `${layer.offsetX} ${layer.offsetY} ${layer.blur} ${layer.spread} rgb(${hexToRgbChannels(layer.color)} / ${String(layer.alpha)})`,
    )
    .join(', ');
}

function serializeValue(
  token: FlatToken,
  index: ReadonlyMap<string, FlatToken>,
  options: GenerateOptions,
): string {
  const target = aliasTarget(token.value);
  if (target !== null) {
    const next = index.get(target);
    if (!next) throw new TokenError(`${dottedPath(token.path)} points at a missing token`);
    return `var(${cssVariableName(next.path)})`;
  }
  switch (token.type) {
    case 'color':
    case 'dimension':
    case 'duration':
      if (typeof token.value !== 'string') {
        throw new TokenError(`${dottedPath(token.path)} must be a string`);
      }
      return token.value;
    case 'fontWeight':
      if (typeof token.value !== 'number') {
        throw new TokenError(`${dottedPath(token.path)} must be a number`);
      }
      return String(token.value);
    case 'fontFamily': {
      const stack = typeof token.value === 'string' ? options.fontStacks[token.value] : undefined;
      if (!stack) {
        throw new TokenError(`no CSS font stack is defined for ${String(token.value)}`);
      }
      return stack;
    }
    case 'shadow':
      return serializeShadow(token);
    case 'typography':
      throw new TokenError(`${dottedPath(token.path)} is a composite; it becomes a utility`);
  }
}

function declaration(name: string, value: string): string {
  return `  ${name}: ${value};`;
}

function themeExport(token: FlatToken): string | null {
  const [head, group, ...rest] = token.path;
  const tail = rest.join('-');
  if (head === 'semantic' && token.type === 'color') return `--color-${[group, ...rest].join('-')}`;
  if (head === 'semantic' && group === 'control') return `--spacing-control-${tail}`;
  if (head === 'primitive' && group === 'space') return `--spacing-${tail}`;
  if (head === 'primitive' && group === 'radius') return `--radius-${tail}`;
  if (head === 'primitive' && group === 'font' && rest[0] === 'family')
    return `--font-${rest[1] ?? ''}`;
  if (head === 'primitive' && group === 'blur') return `--blur-${tail}`;
  if (head === 'shadow') return `--shadow-${group ?? ''}`;
  return null;
}

function isTypographyValue(value: unknown): value is TypographyValue {
  return (
    typeof value === 'object' &&
    value !== null &&
    ['fontFamily', 'fontSize', 'lineHeight', 'letterSpacing'].every(
      (key) => typeof (value as Record<string, unknown>)[key] === 'string',
    ) &&
    'fontWeight' in value
  );
}

function typographyUtility(
  token: FlatToken,
  parsed: ParsedTokens,
  options: GenerateOptions,
): string {
  if (!isTypographyValue(token.value)) {
    throw new TokenError(`${dottedPath(token.path)} is not a typography composite`);
  }
  const name = token.path[token.path.length - 1] ?? '';
  const family = serializeValue(
    {
      path: [...token.path, 'fontFamily'],
      type: 'fontFamily',
      value: token.value.fontFamily,
      description: undefined,
    },
    parsed.index,
    options,
  );
  const weight = serializeValue(
    {
      path: [...token.path, 'fontWeight'],
      type: 'fontWeight',
      value: token.value.fontWeight,
      description: undefined,
    },
    parsed.index,
    options,
  );
  return [
    `@utility type-${name} {`,
    declaration('font-family', family),
    declaration('font-size', token.value.fontSize),
    declaration('font-weight', weight),
    declaration('line-height', token.value.lineHeight),
    declaration('letter-spacing', token.value.letterSpacing),
    '}',
  ].join('\n');
}

/** Stable 32-bit FNV-1a of the source, so the header shows which tokens.json produced the file. */
export function fingerprint(source: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < source.length; i += 1) {
    hash ^= source.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export function generateCss(
  input: unknown,
  options: GenerateOptions = { fontStacks: FONT_STACKS },
): string {
  const parsed = parseTokens(input);
  const literal = (token: FlatToken) =>
    declaration(cssVariableName(token.path), serializeValue(token, parsed.index, options));

  const root = [
    ':root {',
    declaration('color-scheme', 'light'),
    '',
    '  /* primitive — the raw scales; no Tailwind utility is minted for these */',
    ...parsed.primitive.map(literal),
    ...parsed.shadow.map(literal),
    '',
    '  /* semantic — every value is an alias, so a mode only has to remap primitives */',
    ...parsed.semantic.map(literal),
    '}',
  ];

  const dark = [
    ':root[data-theme="dark"] {',
    ...parsed.dark.map(({ key, token }) =>
      declaration(
        `--plate-${key.replaceAll('.', '-')}`,
        serializeValue(token, parsed.index, options),
      ),
    ),
    '}',
  ];

  const themeLines: string[] = ['@theme inline {'];
  for (const namespace of THEME_RESETS) themeLines.push(declaration(`--${namespace}-*`, 'initial'));
  themeLines.push('');
  for (const token of [...parsed.primitive, ...parsed.shadow, ...parsed.semantic]) {
    const name = themeExport(token);
    if (name !== null) themeLines.push(declaration(name, `var(${cssVariableName(token.path)})`));
  }
  themeLines.push('}');

  const utilities = [
    ...parsed.typography.map((token) => typographyUtility(token, parsed, options)),
    ...parsed.motion.map((token) => {
      const name = token.path[token.path.length - 1] ?? '';
      return [
        `@utility duration-${name} {`,
        declaration('transition-duration', `var(${cssVariableName(token.path)})`),
        '}',
      ].join('\n');
    }),
  ];

  return (
    [
      `/* GENERATED from ../tokens.json (fingerprint ${fingerprint(JSON.stringify(input))}) by scripts/build-tokens.ts — do not edit. */`,
      root.join('\n'),
      dark.join('\n'),
      themeLines.join('\n'),
      ...utilities,
    ].join('\n\n') + '\n'
  );
}
