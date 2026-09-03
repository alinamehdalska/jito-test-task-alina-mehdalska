import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useToastStore } from '@/features/toast/store';
import { Toast, TOAST_DURATION_MS } from '@/features/toast/toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    useToastStore.setState({ current: null });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('announces, then dismisses itself after the documented 3 s', () => {
    render(<Toast />);
    act(() => {
      useToastStore
        .getState()
        .show({ title: 'Added to today’s diary', detail: 'Greek yogurt bowl · 320 kcal' });
    });
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Added to today’s diary');
    expect(status).toHaveTextContent('Greek yogurt bowl · 320 kcal');

    act(() => {
      vi.advanceTimersByTime(TOAST_DURATION_MS);
    });
    expect(useToastStore.getState().current).toBeNull();
  });

  it('holds while hovered and offers undo', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onUndo = vi.fn();
    render(<Toast />);
    act(() => {
      useToastStore.getState().show({ title: 'Added', onUndo });
    });

    fireEvent.mouseEnter(screen.getByRole('status'));
    act(() => {
      vi.advanceTimersByTime(TOAST_DURATION_MS * 2);
    });
    expect(useToastStore.getState().current).not.toBeNull();

    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onUndo).toHaveBeenCalledOnce();
    expect(useToastStore.getState().current).toBeNull();
  });
});
