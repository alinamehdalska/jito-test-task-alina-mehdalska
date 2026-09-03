import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { flattenTokens, TokenError } from './dtcg.ts';
import { cssVariableName, FONT_STACKS, generateCss, parseTokens } from './generate.ts';

const repoTokens: unknown = JSON.parse(
  readFileSync(resolve(import.meta.dirname, '../../../tokens.json'), 'utf8'),
);

/** A tiny but complete token tree, so error cases do not depend on the real file. */
function fixture(overrides: Record<string, unknown> = {}): unknown {
  return {
    primitive: {
      color: {
        ink: { 900: { $value: '#362B23', $type: 'color' } },
        paper: { 50: { $value: '#FFFFFF', $type: 'color' } },
      },
      space: { 16: { $value: '16px', $type: 'dimension' } },
      radius: { full: { $value: '9999px', $type: 'dimension' } },
      font: {
        family: { text: { $value: 'SF Pro', $type: 'fontFamily' } },
        weight: { bold: { $value: 700, $type: 'fontWeight' } },
      },
      size: { 44: { $value: '44px', $type: 'dimension' } },
      motion: { duration: { state: { $value: '200ms', $type: 'duration' } } },
    },
    semantic: {
      text: { primary: { $value: '{primitive.color.ink.900}', $type: 'color' } },
      bg: { surface: { $value: '{primitive.color.paper.50}', $type: 'color' } },
      control: { button: { $value: '{primitive.size.44}', $type: 'dimension' } },
    },
    typography: {
      headline: {
        $type: 'typography',
        $value: {
          fontFamily: '{primitive.font.family.text}',
          fontSize: '17px',
          fontWeight: '{primitive.font.weight.bold}',
          lineHeight: '22px',
          letterSpacing: '-0.43px',
        },
      },
    },
    shadow: {
      xs: {
        $type: 'shadow',
        $value: [
          {
            color: '#362B23',
            offsetX: '0px',
            offsetY: '1px',
            blur: '2px',
            spread: '0px',
            alpha: 0.03,
          },
        ],
      },
    },
    theme: {
      dark: { 'text.primary': { $value: '{primitive.color.paper.50}', $type: 'color' } },
    },
    ...overrides,
  };
}

describe('generateCss on a fixture', () => {
  const css = generateCss(fixture());

  it('emits every token as a --plate-* custom property', () => {
    expect(css).toContain('--plate-color-ink-900: #362B23;');
    expect(css).toContain('--plate-text-primary: var(--plate-color-ink-900);');
    expect(css).toContain('--plate-control-button: var(--plate-size-44);');
    expect(css).toContain(`--plate-font-family-text: ${FONT_STACKS['SF Pro']!};`);
    expect(css).toContain('--plate-shadow-xs: 0px 1px 2px 0px rgb(54 43 35 / 0.03);');
  });

  it('exposes only the consumable layers to Tailwind', () => {
    const theme = css.slice(css.indexOf('@theme inline'), css.indexOf('@utility'));
    expect(theme).toContain('--color-*: initial;');
    expect(theme).toContain('--color-text-primary: var(--plate-text-primary);');
    expect(theme).toContain('--spacing-16: var(--plate-space-16);');
    expect(theme).toContain('--spacing-control-button: var(--plate-control-button);');
    expect(theme).toContain('--radius-full: var(--plate-radius-full);');
    expect(theme).toContain('--shadow-xs: var(--plate-shadow-xs);');
    expect(theme).toContain('--font-text: var(--plate-font-family-text);');
    // Primitive colours get no utility — the code equivalent of scoping them [] in Figma.
    expect(theme).not.toContain('--color-ink-900');
    expect(theme).not.toContain('--color-paper-50');
  });

  it('turns typography composites and durations into utilities', () => {
    expect(css).toContain(
      [
        '@utility type-headline {',
        '  font-family: var(--plate-font-family-text);',
        '  font-size: 17px;',
        '  font-weight: var(--plate-font-weight-bold);',
        '  line-height: 22px;',
        '  letter-spacing: -0.43px;',
        '}',
      ].join('\n'),
    );
    expect(css).toContain('@utility duration-state {');
  });

  it('emits the dark overrides without activating them', () => {
    expect(css).toContain(
      ':root[data-theme="dark"] {\n  --plate-text-primary: var(--plate-color-paper-50);\n}',
    );
    expect(css).toContain('color-scheme: light;');
  });

  it('is deterministic', () => {
    expect(generateCss(fixture())).toBe(css);
  });
});

describe('generateCss rejects broken input', () => {
  it('a dangling alias', () => {
    const broken = fixture({
      semantic: { text: { primary: { $value: '{primitive.color.ink.950}', $type: 'color' } } },
    });
    expect(() => generateCss(broken)).toThrow(TokenError);
    expect(() => generateCss(broken)).toThrow(/does not exist/);
  });

  it('an alias cycle', () => {
    const broken = fixture({
      semantic: {
        text: {
          primary: { $value: '{semantic.text.secondary}', $type: 'color' },
          secondary: { $value: '{semantic.text.primary}', $type: 'color' },
        },
      },
    });
    expect(() => generateCss(broken)).toThrow(/cycle/);
  });

  it('a dark override for a token that does not exist', () => {
    const broken = fixture({
      theme: { dark: { 'text.ghost': { $value: '{primitive.color.paper.50}', $type: 'color' } } },
    });
    expect(() => generateCss(broken)).toThrow(/does not exist/);
  });

  it('a font family with no CSS stack', () => {
    const broken = fixture();
    expect(() => generateCss(broken, { fontStacks: {} })).toThrow(/no CSS font stack/);
  });

  it('an unsupported $type', () => {
    const broken = fixture({ primitive: { weird: { $value: 1, $type: 'number' } } });
    expect(() => generateCss(broken)).toThrow(/unsupported \$type/);
  });
});

describe('the repository tokens.json', () => {
  const parsed = parseTokens(repoTokens);

  it('has the documented shape and counts', () => {
    const all = flattenTokens(repoTokens as Parameters<typeof flattenTokens>[0]);
    expect(all).toHaveLength(237);
    expect(parsed.semantic.filter((t) => t.type === 'color')).toHaveLength(51);
    expect(parsed.typography).toHaveLength(15);
    expect(parsed.shadow).toHaveLength(4);
    expect(parsed.dark).toHaveLength(43);
  });

  it('keeps every semantic token an alias', () => {
    for (const token of parsed.semantic) {
      expect(token.value, cssVariableName(token.path)).toMatch(/^\{primitive\./);
    }
  });

  it('carries the four control heights and no fifth', () => {
    const sizes = parsed.primitive.filter((t) => t.path[1] === 'size').map((t) => t.value);
    expect(sizes).toEqual(['24px', '36px', '44px', '52px', '56px']);
  });
});
