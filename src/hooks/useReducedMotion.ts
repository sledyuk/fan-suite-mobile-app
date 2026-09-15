import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

let cached: boolean | null = null;

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(cached ?? false);
  useEffect(() => {
    let alive = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((v) => { cached = v; if (alive) setReduced(v); });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (v) => { cached = v; setReduced(v); });
    return () => { alive = false; sub.remove(); };
  }, []);
  return reduced;
}
