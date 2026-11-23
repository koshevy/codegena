import type { MotionValue } from 'motion/react';

import type { DemoOption } from '../../playground-examples';

export interface DemoButtonProps {
  choice: DemoOption;
  isZooming: boolean;
  labelOpacity: MotionValue<number>;
  onSelect: (specUrl: string, button: HTMLElement) => void;
}
