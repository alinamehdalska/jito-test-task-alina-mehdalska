import { create } from 'zustand';

interface EditEntryState {
  readonly entryId: string | null;
  readonly open: (entryId: string) => void;
  readonly close: () => void;
}

/** Which diary entry the edit sheet (frame 9) is showing; UI state, not a route. */
export const useEditEntryStore = create<EditEntryState>()((set) => ({
  entryId: null,
  open: (entryId) => {
    set({ entryId });
  },
  close: () => {
    set({ entryId: null });
  },
}));
