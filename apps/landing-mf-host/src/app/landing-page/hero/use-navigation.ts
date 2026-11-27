import { useLenis } from 'lenis/react';
import { type MotionValue, useMotionValueEvent } from 'motion/react';
import { type RefObject, useCallback, useState } from 'react';

import {
  finalHeadingScrollTop,
  promptReadyScrollTop,
  unifiedUiStart,
} from '../feature-story';

interface NavigationState {
  handlePlaygroundClick: () => void;
  handleSecondaryClick: () => void;
  isPromptReady: boolean;
}

/**
 * Keeps both hero actions on the same scroll timeline as their destinations.
 */
export function useNavigation(
  scrollY: MotionValue<number>,
  featureSectionsRef: RefObject<HTMLElement | null>,
): NavigationState {
  const lenis = useLenis();
  const [isPromptReady, setIsPromptReady] = useState(false);

  useMotionValueEvent(scrollY, 'change', (value) => {
    setIsPromptReady(value >= promptReadyScrollTop);
  });

  const handlePlaygroundClick = useCallback((): void => {
    const playground = featureSectionsRef.current;

    if (!playground) {
      return;
    }

    const storyTravel = playground.offsetHeight - window.innerHeight;

    const target = playground.offsetTop
      + storyTravel * ((unifiedUiStart + 1) / 2);

    if (lenis) {
      lenis.scrollTo(target);
    }
    else {
      window.scrollTo({ top: target, behavior: 'smooth' });
    }
  }, [
    featureSectionsRef,
    lenis,
  ]);

  const handleSecondaryClick = useCallback((): void => {
    const target = isPromptReady
      ? featureSectionsRef.current?.offsetTop
      : finalHeadingScrollTop;

    if (target === undefined) {
      return;
    }

    if (lenis) {
      lenis.scrollTo(target);
    }
    else {
      window.scrollTo({ top: target, behavior: 'smooth' });
    }
  }, [
    featureSectionsRef,
    isPromptReady,
    lenis,
  ]);

  return {
    handlePlaygroundClick,
    handleSecondaryClick,
    isPromptReady,
  };
}
