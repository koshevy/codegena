import type { EmblaViewportRefType } from 'embla-carousel-react';
import type { ReactNode } from 'react';

import type {
  IllustrationSlide,
} from './illustration-slide';

export interface SlideWindowProps {
  bulletNoun: string;
  carouselRef: EmblaViewportRefType;
  isNarrow: boolean;
  renderedControls: ReactNode;
  selectedIndex: number;
  slides: readonly IllustrationSlide[];
  variant: 'code' | 'foldering';
}
