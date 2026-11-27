import useMediaQuery from '@mui/material/useMediaQuery';
import {
  type MotionValue,
  useMotionValue,
  useTransform,
} from 'motion/react';
import type { RefObject } from 'react';
import { useCallback, useLayoutEffect, useRef } from 'react';

interface PhraseEndingProps {
  contentRef: RefObject<HTMLDivElement | null>;
  headingRef: RefObject<HTMLHeadingElement | null>;
  stageRef: RefObject<HTMLDivElement | null>;
  closingStop: number;
  reverse: boolean;
  scrollY: MotionValue<number>;
}

interface PhraseEnding {
  closingRef: RefObject<HTMLSpanElement | null>;
  lineRef: RefObject<HTMLSpanElement | null>;
  sequenceRef: RefObject<HTMLSpanElement | null>;
  surroundingOpacity: MotionValue<number>;
  trackRef: RefObject<HTMLSpanElement | null>;
  x: MotionValue<number>;
  y: MotionValue<number> | MotionValue<string>;
}

/**
 * Centers the final phrase as its neighboring text fades after it enters view.
 */
export function usePhraseEnding({
  contentRef,
  headingRef,
  stageRef,
  closingStop,
  reverse,
  scrollY,
}: PhraseEndingProps): PhraseEnding {
  const isNarrow = useMediaQuery('(max-width: 700px)');
  const lineRef = useRef<HTMLSpanElement>(null);
  const trackRef = useRef<HTMLSpanElement>(null);
  const sequenceRef = useRef<HTMLSpanElement>(null);
  const closingRef = useRef<HTMLSpanElement>(null);
  const sequenceWidth = useMotionValue(0);
  const closingX = useMotionValue(0);
  const closingOffset = useMotionValue(0);
  const closingWidth = useMotionValue(0);
  const trackLeft = useMotionValue(0);
  const lineWidth = useMotionValue(0);
  const finalY = useMotionValue(0);

  const desktopY = useTransform(
    scrollY,
    [50, 800],
    ['calc(0vh - 0rem)', 'calc(-35vh - 2rem)'],
  );

  const mobileY = useTransform(() => {
    const progress = Math.min(Math.max((scrollY.get() - 50) / 750, 0), 1);

    return progress * finalY.get();
  });

  const y = isNarrow ? mobileY : desktopY;

  const x = useTransform(() => {
    const value = scrollY.get();
    const cycle = Math.max(0, Math.min(value, 500) - 50) / 550;
    const loopX = (reverse ? cycle - 1 : -cycle) * sequenceWidth.get();

    if (value <= 500) {
      return loopX;
    }

    const progress = Math.min((value - 500) / (closingStop - 500), 1);

    return loopX + (closingX.get() - loopX) * progress;
  });

  const surroundingOpacity = useTransform(() => {
    const value = scrollY.get();

    if (value <= 500) {
      return 1;
    }

    const visibleCapacity = Math.min(closingWidth.get(), lineWidth.get());

    if (visibleCapacity === 0) {
      return 1;
    }

    const left = trackLeft.get() + closingOffset.get() + x.get();
    const right = left + closingWidth.get();

    const visibleWidth = Math.max(
      0,
      Math.min(right, lineWidth.get()) - Math.max(left, 0),
    );

    const visibleRatio = visibleWidth / visibleCapacity;
    const fadeProgress = Math.min(Math.max((visibleRatio - 0.2) / 0.5, 0), 1);

    return 1 - fadeProgress;
  });

  const measure = useCallback((): void => {
    const line = lineRef.current;
    const track = trackRef.current;
    const sequence = sequenceRef.current;
    const closing = closingRef.current;

    if (!line || !track || !sequence || !closing) {
      return;
    }

    const trackRect = track.getBoundingClientRect();
    const closingRect = closing.getBoundingClientRect();
    const closingOffsetPx = closingRect.left - trackRect.left;
    const width = line.clientWidth;
    const centerX = width / 2;
    const heading = headingRef.current;
    const content = contentRef.current;
    const stage = stageRef.current;

    if (content && stage && heading instanceof HTMLElement) {
      const headingTop = content.getBoundingClientRect().top
        - stage.getBoundingClientRect().top
        + heading.offsetTop;

      finalY.set(32 - headingTop);
    }

    sequenceWidth.set(sequence.offsetWidth);
    trackLeft.set(track.offsetLeft);
    lineWidth.set(width);
    closingOffset.set(closingOffsetPx);
    closingWidth.set(closingRect.width);
    closingX.set(
      centerX - track.offsetLeft - closingOffsetPx - closingRect.width / 2,
    );
  }, [
    contentRef,
    headingRef,
    stageRef,
    closingOffset,
    closingWidth,
    closingX,
    finalY,
    lineWidth,
    trackLeft,
    sequenceWidth,
  ]);

  useLayoutEffect(() => {
    const line = lineRef.current;
    const track = trackRef.current;
    const sequence = sequenceRef.current;
    const closing = closingRef.current;

    if (!line || !track || !sequence || !closing) {
      return;
    }

    const observer = new ResizeObserver(measure);

    observer.observe(line);
    observer.observe(track);
    observer.observe(sequence);
    observer.observe(closing);
    measure();

    return () => observer.disconnect();
  }, [measure]);

  return {
    closingRef,
    lineRef,
    sequenceRef,
    surroundingOpacity,
    trackRef,
    x,
    y,
  };
}
