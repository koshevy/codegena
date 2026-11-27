import type { MotionValue } from 'motion/react';
import type { ReactNode } from 'react';

interface IllustrationSlideDetails {
  description: ReactNode;
  fileName: string;
  icon: ReactNode;
  tooltipTitle: string;
}

export interface IllustrationCodeSlide extends IllustrationSlideDetails {
  kind: 'code';
  source: string;
}

interface IllustrationFolderSlide extends IllustrationSlideDetails {
  kind: 'folder-tree';
  renderedContent: ReactNode;
}

export type IllustrationSlide = IllustrationCodeSlide | IllustrationFolderSlide;

export interface IllustrationCarouselProps {
  ariaLabel: string;
  bulletNoun: string;
  slides: readonly IllustrationSlide[];
  scrollProgress?: MotionValue<number>;
  variant?: 'code' | 'foldering';
}
