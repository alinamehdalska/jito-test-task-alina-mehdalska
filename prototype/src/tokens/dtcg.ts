/**
 * A minimal reader for the W3C Design Tokens (DTCG) shape used by ../tokens.json.
 *
 * It knows only what that file uses: nested groups, `$value`/`$type` leaves,
 * `{dotted.path}` aliases and a handful of `$type`s. Anything else is an error,
 * because a token the generator cannot place is a token Figma and the code would
 * disagree about.
 */

export const TOKEN_TYPES = [
  'color',
  'dimension',
  'fontFamily',
  'fontWeight',
  'typography',
  'shadow',
  'duration',
] as const;

export type TokenType = (typeof TOKEN_TYPES)[number];

export interface TokenLeaf {
  readonly $type: TokenType;
  readonly $value: unknown;
  readonly $description?: string;
}

export interface TokenGroup {
  readonly [key: string]: TokenGroup | TokenLeaf | string | undefined;
}

export interface FlatToken {
  /** Full dotted path segments, e.g. `['primitive', 'color', 'coral', '400']`. */
  readonly path: readonly string[];
  readonly type: TokenType;
  readonly value: unknown;
  readonly description: string | undefined;
}

export class TokenError extends Error {
  override readonly name = 'TokenError';
}

const ALIAS_PATTERN = /^\{([A-Za-z0-9_.-]+)\}$/;
const MAX_ALIAS_HOPS = 5;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTokenType(value: unknown): value is TokenType {
  return typeof value === 'string' && (TOKEN_TYPES as readonly string[]).includes(value);
}

export function isTokenLeaf(node: unknown): node is TokenLeaf {
  return isRecord(node) && '$value' in node;
}

export function isTokenGroup(node: unknown): node is TokenGroup {
  return isRecord(node) && !('$value' in node);
}

/** Returns the dotted path an alias value points at, or `null` for a literal. */
export function aliasTarget(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const match = ALIAS_PATTERN.exec(value);
  return match?.[1] ?? null;
}

export function dottedPath(path: readonly string[]): string {
  return path.join('.');
}

/** Depth-first, insertion-ordered list of every leaf under `root`. */
export function flattenTokens(root: TokenGroup, prefix: readonly string[] = []): FlatToken[] {
  const leaves: FlatToken[] = [];
  for (const [key, node] of Object.entries(root)) {
    if (key.startsWith('$')) continue;
    const path = [...prefix, key];
    if (isTokenLeaf(node)) {
      if (!isTokenType(node.$type)) {
        throw new TokenError(`${dottedPath(path)} has an unsupported $type ${String(node.$type)}`);
      }
      leaves.push({ path, type: node.$type, value: node.$value, description: node.$description });
    } else if (isTokenGroup(node)) {
      leaves.push(...flattenTokens(node, path));
    } else {
      throw new TokenError(`${dottedPath(path)} is neither a group nor a token`);
    }
  }
  return leaves;
}

export function indexTokens(tokens: readonly FlatToken[]): Map<string, FlatToken> {
  return new Map(tokens.map((token) => [dottedPath(token.path), token]));
}

/**
 * Follows `{alias}` chains until a literal is reached. Throws on a missing target
 * or a cycle so a broken alias can never silently become a broken style.
 */
export function resolveToken(
  token: FlatToken,
  index: ReadonlyMap<string, FlatToken>,
  trail: readonly string[] = [],
): FlatToken {
  const target = aliasTarget(token.value);
  if (target === null) return token;
  const here = dottedPath(token.path);
  if (trail.includes(target) || trail.length >= MAX_ALIAS_HOPS) {
    throw new TokenError(`alias cycle at ${[...trail, here, target].join(' → ')}`);
  }
  const next = index.get(target);
  if (!next) {
    throw new TokenError(`${here} points at {${target}}, which does not exist`);
  }
  return resolveToken(next, index, [...trail, here]);
}
