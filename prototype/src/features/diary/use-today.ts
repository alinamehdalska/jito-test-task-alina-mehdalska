import { startOfDay } from 'date-fns';
import { useSyncExternalStore } from 'react';

const ONE_MINUTE = 60_000;

function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, ONE_MINUTE);
  return () => {
    window.clearInterval(timer);
  };
}

function readToday(): number {
  return startOfDay(new Date()).getTime();
}

/** The current calendar day, re-read each minute so a session that crosses midnight follows. */
export function useToday(): Date {
  return new Date(useSyncExternalStore(subscribe, readToday, readToday));
}
