import type { ReactElement } from 'react';

import { ScrollHintStyles } from './scroll-hint.styles';
import { ScrollMouse } from '../../scroll-mouse';

export function ScrollHint(): ReactElement {
  return (
    <ScrollHintStyles
      aria-label="Scroll to discover"
      component="span"
      role="group"
    >
      <ScrollMouse />
      <span>SCROLL TO DISCOVER</span>
    </ScrollHintStyles>
  );
}
