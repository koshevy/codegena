import { type MotionValue, useMotionValueEvent } from 'motion/react';
import { useCallback, useState } from 'react';

type Phase = 'opening' | 'expanded' | 'final';

function getPhase(scrollY: number): Phase {
  if (scrollY >= 870) {
    return 'final';
  }

  if (scrollY >= 50) {
    return 'expanded';
  }

  return 'opening';
}

/**
 * Tracks the opening, scrolling, and final heading states.
 */
export function usePhase(
  scrollY: MotionValue<number>,
): Phase {
  const [phase, setPhase] = useState(() => (
    getPhase(scrollY.get())
  ));

  const handleScrollChange = useCallback((value: number): void => {
    setPhase(getPhase(value));
  }, []);

  useMotionValueEvent(scrollY, 'change', handleScrollChange);

  return phase;
}
