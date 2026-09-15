import { useRef } from 'react';

/** Calls `onUnlock` after `target` taps within `windowMs`. Used for the hire-me easter egg. */
export function useSecretTap(onUnlock: () => void, target = 5, windowMs = 1500) {
  const taps = useRef<number[]>([]);
  return () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < windowMs), now];
    if (taps.current.length >= target) { taps.current = []; onUnlock(); }
  };
}
