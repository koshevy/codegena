import useMediaQuery from '@mui/material/useMediaQuery';
import {
  type MotionValue,
  useScroll,
  useTransform,
} from 'motion/react';

interface ScrollAnimation {
  haloScale: MotionValue<number>;
  haloY: MotionValue<string>;
  mascotOpacity: MotionValue<number>;
  mascotScale: MotionValue<number>;
  mascotY: MotionValue<string>;
  patternScale: MotionValue<number>;
  scrollY: MotionValue<number>;
  shouldReduceMotion: boolean | null;
}

/**
 * Maps hero scroll distance to reversible halo and mascot motion.
 */
export function useScrollAnimation(): ScrollAnimation {
  const shouldReduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const { scrollY } = useScroll();
  const haloScale = useTransform(scrollY, [0, 800], [1, 1.55]);
  const haloY = useTransform(scrollY, [0, 800], ['0vh', '14vh']);
  const mascotOpacity = useTransform(scrollY, [50, 800], [1, 0]);
  const mascotScale = useTransform(scrollY, [50, 800], [1, 0.5]);
  const mascotY = useTransform(scrollY, [50, 800], ['0vh', '-17vh']);
  const patternScale = useTransform(scrollY, [0, 800], [1, 1.14]);

  return {
    haloScale,
    haloY,
    mascotOpacity,
    mascotScale,
    mascotY,
    patternScale,
    scrollY,
    shouldReduceMotion,
  };
}
