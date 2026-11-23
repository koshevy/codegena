import {
  type MotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import { type RefObject, useState } from 'react';

import { getClosingBlobScale } from './blob-growth';
import {
  getActiveStep,
  getBlobProgress,
  getFolderingProgress,
  getSectionProgress,
  getTerminalProgressPercent,
} from './feature-scroll-progress';
import { useIsBlobCoveringScreen } from './use-is-blob-covering-screen';
import {
  finalHeadingScrollTop,
  peelEntranceScrollTop,
  promptReadyScrollTop,
} from '../feature-story';

interface FeatureScrollState {
  activeStep: number;
  blobProgress: MotionValue<number>;
  blobScale: MotionValue<number> | number;
  folderingProgress: MotionValue<number>;
  isBlobCoveringScreen: boolean;
  isClosingSequence: boolean;
  shouldReduceMotion: boolean | null;
  sectionProgress: MotionValue<number>;
  stageBottomRadius: MotionValue<number>;
  stageScale: MotionValue<number>;
  stageTopRadius: MotionValue<number>;
  stageY: MotionValue<number>;
  terminalProgressPercent: number;
}

/**
 * Tracks the pinned stage and changes its copy only at story boundaries.
 */
export function useFeatureScroll(
  isNarrow: boolean,
  stageRef: RefObject<HTMLElement | null>,
): FeatureScrollState {
  const [activeStep, setActiveStep] = useState(0);
  const [terminalProgressPercent, setTerminalProgressPercent] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const isClosingSequence = activeStep >= 4;

  const { scrollYProgress: entranceProgress } = useScroll({
    offset: ['start end', 'start start'],
    target: stageRef,
  });

  const { scrollYProgress: storyProgress } = useScroll({
    offset: ['start start', 'end end'],
    target: stageRef,
  });

  const { scrollYProgress: exitProgress } = useScroll({
    offset: ['end end', 'end start'],
    target: stageRef,
  });

  const { scrollY } = useScroll();

  const stageScale = useTransform(() => (
    (isNarrow ? 1 : 0.86 + entranceProgress.get() * 0.14)
    - exitProgress.get() * 0.14
  ));

  const stageTopRadius = useTransform(() => (
    isNarrow ? 0 : (1 - entranceProgress.get()) * 36
  ));

  const stageBottomRadius = useTransform(() => (
    stageTopRadius.get() + exitProgress.get() * 36
  ));

  const stageY = useTransform(
    scrollY,
    [
      peelEntranceScrollTop,
      promptReadyScrollTop,
      finalHeadingScrollTop,
    ],
    [0, -100, 0],
  );

  const storyStep = useTransform(storyProgress, getActiveStep);
  const sectionProgress = useTransform(storyProgress, getSectionProgress);
  const blobProgress = useTransform(storyProgress, getBlobProgress);
  const closingBlobScale = useTransform(blobProgress, getClosingBlobScale);
  const folderingProgress = useTransform(storyProgress, getFolderingProgress);
  const isBlobCoveringScreen = useIsBlobCoveringScreen(
    isClosingSequence,
    closingBlobScale,
  );

  const terminalProgress = useTransform(
    storyProgress,
    getTerminalProgressPercent,
  );

  useMotionValueEvent(storyStep, 'change', setActiveStep);
  useMotionValueEvent(terminalProgress, 'change', setTerminalProgressPercent);

  return {
    activeStep,
    blobProgress,
    blobScale: isClosingSequence ? closingBlobScale : 1,
    folderingProgress,
    isBlobCoveringScreen,
    isClosingSequence,
    sectionProgress,
    shouldReduceMotion,
    stageBottomRadius,
    stageScale,
    stageTopRadius,
    stageY,
    terminalProgressPercent,
  };
}
