import {
  type MotionValue,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from 'motion/react';
import { type RefObject, useLayoutEffect } from 'react';

import { blobSixthStart } from './blob-growth';

export function useProgressBlobOffset(
  stageRef: RefObject<HTMLDivElement | null>,
  progress: MotionValue<number>,
  isClosingSequence: boolean,
): MotionValue<number> | MotionValue<string> {
  const stageHeight = useMotionValue(0);

  useLayoutEffect(() => {
    const stage = stageRef.current;

    if (!stage) {
      return;
    }

    const measureStage = (): void => stageHeight.set(stage.clientHeight);
    const observer = new ResizeObserver(measureStage);

    measureStage();
    observer.observe(stage);

    return () => observer.disconnect();
  }, [stageHeight, stageRef]);

  // Travel follows the stage height, and the centering offset follows the blob's box.
  const stageTravel = useTransform(() => stageHeight.get() * progress.get());
  const blobOffset = useTransform(progress, [0, 1], [-50, 50]);
  const sectionY = useMotionTemplate`calc(${stageTravel}px + ${blobOffset}%)`;

  const closingPosition = useTransform(
    progress,
    [0, blobSixthStart / 2, blobSixthStart],
    [-0.2, 0.5, 0.7],
  );
  const closingY = useTransform(() => stageHeight.get() * closingPosition.get());

  return isClosingSequence ? closingY : sectionY;
}
