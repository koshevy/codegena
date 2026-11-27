import type { MotionValue } from 'motion/react';
import type { RefObject } from 'react';

export interface HeroPhraseLinesProps {
  contentRef: RefObject<HTMLDivElement | null>;
  firstClosingPhrase: string;
  hasSettled: boolean;
  headingRef: RefObject<HTMLHeadingElement | null>;
  scrollY: MotionValue<number>;
  secondClosingPhrase: string;
  stageRef: RefObject<HTMLDivElement | null>;
}
