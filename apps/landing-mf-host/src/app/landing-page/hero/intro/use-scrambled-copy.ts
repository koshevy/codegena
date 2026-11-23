import { type MotionValue, useMotionValueEvent } from 'motion/react';
import { useCallback, useMemo, useState } from 'react';

import {
  type TextSegment,
  scrambleText,
} from './scramble-text';
import {
  ideaText,
  openingText,
} from './text';

interface ScrambledCopy {
  accessibleText: string;
  segments: TextSegment[];
}

const start = 100;
const duration = 220;

/**
 * Keeps the center-out text change aligned with reversible hero scrolling.
 */
export function useScrambledCopy(
  scrollY: MotionValue<number>,
  shouldReduceMotion: boolean | null,
): ScrambledCopy {
  const [progress, setProgress] = useState(() => (
    Math.min(1, Math.max(0, (scrollY.get() - start) / duration))
  ));

  const handleScrollChange = useCallback((value: number): void => {
    setProgress(Math.min(1, Math.max(0, (value - start) / duration)));
  }, []);

  useMotionValueEvent(scrollY, 'change', handleScrollChange);

  const resolvedProgress = shouldReduceMotion
    ? Number(progress >= 0.5)
    : progress;

  const accessibleText = resolvedProgress < 0.5
    ? openingText
    : ideaText;

  const segments = useMemo(() => (
    scrambleText(
      openingText,
      ideaText,
      resolvedProgress,
    )
  ), [resolvedProgress]);

  return { accessibleText, segments };
}
