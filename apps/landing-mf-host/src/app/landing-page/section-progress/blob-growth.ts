import {
  closingSequenceStart,
  featureStoryHeight,
  unifiedUiStart,
} from '../feature-story';

const closingSequenceLength = 1 - closingSequenceStart;

export const blobFullScale = 32;

export const blobSixthStart = (
  (unifiedUiStart - closingSequenceStart) / closingSequenceLength
);

function getGrowthRange(): { start: number; end: number } {
  const viewportHeight = typeof window === 'undefined' ? 900 : window.innerHeight;

  const closingTravelPx = closingSequenceLength
    * (featureStoryHeight - 1) * viewportHeight;

  const growthTravelPx = 0.18 * viewportHeight;
  const startOffsetPx = Math.min(100, growthTravelPx * 0.9);
  const start = blobSixthStart - startOffsetPx / closingTravelPx;

  return {
    end: start + growthTravelPx / closingTravelPx,
    start,
  };
}

/**
 * `getBlobProgress` maps sections 05 and 06 equally onto 0–1.
 */
export function getBlobFullScaleSectionProgress(): number {
  const { end } = getGrowthRange();

  return (end - 0.5) * 2;
}

export function getClosingBlobScale(progress: number): number {
  const { end, start } = getGrowthRange();

  if (progress < blobSixthStart) {
    const fifthProgress = Math.max(0, Math.min(1, (
      (progress - start) / (blobSixthStart - start)
    )));

    return 1 + fifthProgress;
  }

  const sixthProgress = Math.max(0, Math.min(1, (
    (progress - blobSixthStart) / (end - blobSixthStart)
  )));

  return 2 + (blobFullScale - 2) * sixthProgress ** 5;
}
