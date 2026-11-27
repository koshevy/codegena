import { Mouse } from 'lucide-react';
import type { ReactElement } from 'react';

import { ScrollMouseStyles } from './scroll-mouse.styles';

export function ScrollMouse(): ReactElement {
  return (
    <ScrollMouseStyles
      aria-hidden
      component="span"
    >
      <Mouse
        size={20}
        strokeWidth={1.5}
      />
    </ScrollMouseStyles>
  );
}
