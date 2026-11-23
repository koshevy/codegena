import { DevModeEnvContext } from '@codegena/util-dev-mode';
import { MousePointerClick } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { type ReactElement, useContext } from 'react';

import { ClickCueStyles } from './click-cue.styles';

interface ClickCueProps {
  tone?: 'light' | 'dark';
}

const clickMotion = {
  rotate: [-15, -8, -15],
  scale: [1, 0.88, 1],
  x: [32, 0, 32],
  y: [32, 0, 32],
};

const clickTransition = {
  duration: 2.4,
  ease: 'easeInOut',
  repeat: Infinity,
} as const;

/**
 * Points to a click target without becoming another focus target.
 */
export function ClickCue({
  tone = 'light',
}: ClickCueProps): ReactElement {
  const { isTestingMode } = useContext(DevModeEnvContext);
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = !shouldReduceMotion && !isTestingMode;

  return (
    <ClickCueStyles
      animate={shouldAnimate ? clickMotion : undefined}
      aria-hidden
      data-tone={tone}
      initial={false}
      transition={shouldAnimate ? clickTransition : undefined}
    >
      <MousePointerClick
        size={44}
        strokeWidth={2}
      />
    </ClickCueStyles>
  );
}
