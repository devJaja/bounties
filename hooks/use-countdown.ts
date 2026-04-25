"use client";

import { useSyncExternalStore } from "react";

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function compute(targetMs: number): CountdownTime {
  const diff = targetMs - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

/**
 * Counts down to a target timestamp (ms).
 *
 * Uses useSyncExternalStore rather than useState + useEffect so we never
 * call setState inside an effect body or touch refs during render — both of
 * which are blocked by this project's ESLint config.
 *
 * useSyncExternalStore is the React-recommended API for subscribing to any
 * external store (here: the system clock). The subscribe function sets up the
 * interval and calls the provided callback every second; React reads the
 * current snapshot via getSnapshot on every tick and re-renders only when the
 * value actually changes.
 *
 * Accepts a number (ms timestamp) rather than a Date so callers can memoize
 * a stable primitive — new Date(str) produces a new object identity on every
 * render which would force a new subscription each cycle.
 */
export function useCountdown(targetMs: number | null): CountdownTime | null {
  const value = useSyncExternalStore(
    // subscribe — called once; React passes a callback to notify it of changes
    (onStoreChange) => {
      if (targetMs === null) return () => {};

      const id = setInterval(() => {
        onStoreChange();
        const diff = targetMs - Date.now();
        if (diff <= 0) clearInterval(id);
      }, 1000);

      return () => clearInterval(id);
    },
    // getSnapshot — called on every render and after every onStoreChange()
    () => (targetMs !== null ? compute(targetMs) : null),
    // getServerSnapshot — used during SSR; return null so the server renders nothing
    () => null,
  );

  return value;
}
