import type { MotionValue } from 'motion/react';

export interface UnifiedUiIllustrationProps {
  isZooming: boolean;
  labelOpacity: MotionValue<number>;
  onSelect: (specUrl: string, button: HTMLElement) => void;
}
