import { type MotionValue, useMotionValueEvent } from 'motion/react';
import { useState } from 'react';

/**
 * Announces scroll progress in five-percent steps without repainting every frame.
 */
export function useProgressPercent(progress: MotionValue<number>): number {
  const [percent, setPercent] = useState(() => Math.round(progress.get() * 20) * 5);

  useMotionValueEvent(progress, 'change', (value) => {
    setPercent(Math.round(value * 20) * 5);
  });

  return percent;
}
