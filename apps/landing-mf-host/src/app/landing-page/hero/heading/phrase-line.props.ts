import type { MotionValue } from 'motion/react';
import type { RefObject } from 'react';

export interface PhraseLineProps {
  contentRef: RefObject<HTMLDivElement | null>;
  headingRef: RefObject<HTMLHeadingElement | null>;
  stageRef: RefObject<HTMLDivElement | null>;
  after: readonly string[];
  before: readonly string[];
  closingColor: string;
  closingPhrase: string;
  closingStop: number;
  extraOpacity: MotionValue<number>;
  initialOffset: string;
  main: readonly string[];
  mainColor: MotionValue<string>;
  reverse?: boolean;
  scrollY: MotionValue<number>;
}
