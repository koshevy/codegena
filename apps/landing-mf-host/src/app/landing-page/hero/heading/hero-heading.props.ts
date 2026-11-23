import type { MotionValue } from 'motion/react';
import type { RefObject } from 'react';

export interface HeroHeadingProps {
  contentRef: RefObject<HTMLDivElement | null>;
  stageRef: RefObject<HTMLDivElement | null>;
  scrollY: MotionValue<number>;
  shouldReduceMotion: boolean | null;
}
