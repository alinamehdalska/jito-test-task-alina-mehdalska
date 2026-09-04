import { create } from 'zustand';

import { createSeedEntries, SEED_GOAL } from '@/data/seed-diary';
import type { DiaryEntry, Goal } from '@/domain/types';

export type LogInput = Omit<DiaryEntry, 'id'>;
/** What the edit sheet can change: how much, which meal, when. */
export type EntryPatch = Partial<Pick<DiaryEntry, 'amount' | 'nutrition' | 'meal' | 'loggedAt'>>;

interface DiaryState {
  readonly goal: Goal;
  readonly entries: readonly DiaryEntry[];
  readonly favouriteProductIds: readonly string[];
  readonly recentProductIds: readonly string[];
  readonly log: (input: LogInput) => DiaryEntry;
  readonly update: (id: string, patch: EntryPatch) => void;
  readonly remove: (id: string) => void;
  /** Puts a removed entry back exactly as it was — the delete toast's Undo. */
  readonly restore: (entry: DiaryEntry) => void;
  readonly toggleFavourite: (productId: string) => void;
  readonly touchRecent: (productId: string) => void;
  readonly reset: (today?: Date) => void;
}

const RECENT_LIMIT = 3;

function createId(): string {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `entry-${String(Date.now())}`;
}

function seedState(today: Date) {
  return {
    goal: SEED_GOAL,
    entries: createSeedEntries(today),
    favouriteProductIds: ['greek-yogurt-2'],
    recentProductIds: ['greek-yogurt-2', 'banana', 'oat-milk'],
  };
}

/**
 * Everything the diary knows: the budget, what was logged and when. In-memory only — the
 * prototype resets on reload, and the seed is dated to the day it loads.
 */
export const useDiaryStore = create<DiaryState>()((set) => ({
  ...seedState(new Date()),
  log: (input) => {
    const entry: DiaryEntry = { ...input, id: createId() };
    set((state) => ({ entries: [...state.entries, entry] }));
    return entry;
  },
  update: (id, patch) => {
    set((state) => ({
      entries: state.entries.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
    }));
  },
  remove: (id) => {
    set((state) => ({ entries: state.entries.filter((entry) => entry.id !== id) }));
  },
  restore: (entry) => {
    set((state) =>
      state.entries.some((existing) => existing.id === entry.id)
        ? state
        : { entries: [...state.entries, entry] },
    );
  },
  toggleFavourite: (productId) => {
    set((state) => ({
      favouriteProductIds: state.favouriteProductIds.includes(productId)
        ? state.favouriteProductIds.filter((id) => id !== productId)
        : [...state.favouriteProductIds, productId],
    }));
  },
  touchRecent: (productId) => {
    set((state) => ({
      recentProductIds: [
        productId,
        ...state.recentProductIds.filter((id) => id !== productId),
      ].slice(0, RECENT_LIMIT),
    }));
  },
  reset: (today = new Date()) => {
    set(seedState(today));
  },
}));
