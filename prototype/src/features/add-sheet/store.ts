import { create } from 'zustand';

interface AddSheetState {
  readonly isOpen: boolean;
  readonly open: () => void;
  readonly close: () => void;
}

/** The central `+` opens one sheet from anywhere; it is UI state, not a route. */
export const useAddSheetStore = create<AddSheetState>()((set) => ({
  isOpen: false,
  open: () => {
    set({ isOpen: true });
  },
  close: () => {
    set({ isOpen: false });
  },
}));
