import {
  type MotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import type { RefObject } from 'react';
import { useRef } from 'react';

interface BackgroundState {
  backgroundScale: MotionValue<number>;
  sectionRef: RefObject<HTMLElement | null>;
  shouldReduceMotion: boolean | null;
}

/**
 * Shrinks the Ideology halo and bottom-anchored contours while scrolling.
 */
export function useBackground(): BackgroundState {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    offset: ['start -10%', 'end start'],
    target: sectionRef,
  });

  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1.5, 1]);

  return {
    backgroundScale,
    sectionRef,
    shouldReduceMotion,
  };
}
