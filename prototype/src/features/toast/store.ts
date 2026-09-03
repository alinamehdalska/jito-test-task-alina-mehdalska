import { create } from 'zustand';

export interface ToastMessage {
  readonly id: number;
  readonly title: string;
  readonly detail?: string | undefined;
  /** Present when the action can be reversed — logging always can. */
  readonly onUndo?: (() => void) | undefined;
}

interface ToastState {
  readonly current: ToastMessage | null;
  readonly show: (message: Omit<ToastMessage, 'id'>) => void;
  readonly dismiss: () => void;
}

let nextId = 1;

export const useToastStore = create<ToastState>()((set) => ({
  current: null,
  show: (message) => {
    set({ current: { ...message, id: nextId++ } });
  },
  dismiss: () => {
    set({ current: null });
  },
}));
