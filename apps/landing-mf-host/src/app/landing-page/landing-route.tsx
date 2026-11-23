import GlobalStyles from '@mui/material/GlobalStyles';
import { ReactLenis } from 'lenis/react';
import { MotionConfig } from 'motion/react';
import type { ComponentProps, ReactElement } from 'react';

import { LandingPage } from './landing-page';

export function LandingRoute(props: ComponentProps<typeof LandingPage>): ReactElement {
  return (
    <MotionConfig reducedMotion="user">
      <GlobalStyles styles={{ html: { scrollbarWidth: 'none' } }} />
      <ReactLenis
        root
        options={{ anchors: true, autoRaf: true }}
      >
        <LandingPage {...props} />
      </ReactLenis>
    </MotionConfig>
  );
}
