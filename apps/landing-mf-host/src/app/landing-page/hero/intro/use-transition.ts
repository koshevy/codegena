import useMediaQuery from '@mui/material/useMediaQuery';
import { type MotionValue, useTransform } from 'motion/react';

interface TransitionState {
  copyOpacity: MotionValue<number>;
  copyScale: MotionValue<number>;
  copyVisibility: MotionValue<'hidden' | 'visible'>;
  installOpacity: MotionValue<number>;
  installScale: MotionValue<number>;
  installY: MotionValue<string>;
  promptOpacity: MotionValue<number>;
  promptScale: MotionValue<number>;
  promptY: MotionValue<string>;
  replacementVisibility: MotionValue<'hidden' | 'visible'>;
  replacementY: MotionValue<string>;
  rootY: MotionValue<string>;
}

/**
 * Replaces the completed intro with a command and prompt as the hero scrolls.
 */
export function useTransition(
  scrollY: MotionValue<number>,
  shouldReduceMotion: boolean | null,
): TransitionState {
  const isNarrow = useMediaQuery('(max-width: 700px)');

  const rootY = useTransform(scrollY, [50, 800], ['0vh', '-18vh']);

  const copyScale = useTransform(
    scrollY,
    [50, 800],
    [1, isNarrow ? 1.1 : 1.4],
  );

  const copyOpacity = useTransform(scrollY, [500, 560], [1, 0]);

  const copyVisibility = useTransform(scrollY, (value) => (
    value < (shouldReduceMotion ? 500 : 560) ? 'visible' : 'hidden'
  ));

  const replacementVisibility = useTransform(scrollY, (value) => (
    value < 500 ? 'hidden' : 'visible'
  ));

  const replacementY = useTransform(
    scrollY,
    [500, 790],
    ['calc(0vh + 0rem)', 'calc(-20vh + 1rem)'],
  );

  const installOpacity = useTransform(scrollY, [500, 590], [0, 1]);
  const installScale = useTransform(scrollY, [500, 590], [0.92, 1]);
  const installY = useTransform(scrollY, [500, 590], ['1.5rem', '0rem']);
  const promptOpacity = useTransform(scrollY, [540, 790], [0, 1]);
  const promptScale = useTransform(scrollY, [540, 790], [0.96, 1]);
  const promptY = useTransform(scrollY, [540, 790], ['2rem', '0rem']);

  return {
    copyOpacity,
    copyScale,
    copyVisibility,
    installOpacity,
    installScale,
    installY,
    promptOpacity,
    promptScale,
    promptY,
    replacementVisibility,
    replacementY,
    rootY,
  };
}
