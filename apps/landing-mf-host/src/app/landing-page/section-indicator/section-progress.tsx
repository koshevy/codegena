import type { ReactElement } from 'react';

import { SectionProgressStyles } from './section-progress.styles';
import { ScrollMouse } from '../scroll-mouse';

interface SectionProgressProps {
  current: number;
  hasScrollCue?: boolean;
}

/**
 * Counts the welcome, six feature stops, and final ideology screen.
 */
export function SectionProgress({
  current,
  hasScrollCue = false,
}: SectionProgressProps): ReactElement {
  const count = `${String(current).padStart(2, '0')} / 08`;
  const renderedMouse = hasScrollCue && <ScrollMouse />;

  return (
    <SectionProgressStyles
      aria-label={`Landing section ${current} of 8`}
      component="span"
      role="status"
    >
      {renderedMouse}
      {count}
    </SectionProgressStyles>
  );
}
