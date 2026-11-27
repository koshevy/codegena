import type { MotionValue } from 'motion/react';
import { useCallback, useSyncExternalStore } from 'react';

import { blobFullScale } from './blob-growth';

function hasServerCoverage(): boolean {
  return false;
}

export function useIsBlobCoveringScreen(
  isClosingSequence: boolean,
  scale: MotionValue<number>,
): boolean {
  const subscribe = useCallback((onChange: () => void) => (
    scale.on('change', onChange)
  ), [scale]);

  const getSnapshot = useCallback(() => (
    isClosingSequence && scale.get() >= blobFullScale
  ), [
    isClosingSequence,
    scale,
  ]);

  return useSyncExternalStore(subscribe, getSnapshot, hasServerCoverage);
}
