import {
  ThemedScrollAreaStyles,
  useThemedScrollArea,
} from '@codegena/ui-unified/scrolling';
import Box from '@mui/material/Box';
import { type ReactElement, useRef } from 'react';

export interface ThemedScrollAreaExampleProps {
  autoHide?: 'move' | 'never';
}

export function ThemedScrollAreaExample({
  autoHide = 'never',
}: ThemedScrollAreaExampleProps): ReactElement {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useThemedScrollArea(hostRef, viewportRef, { autoHide });

  return (
    <Box sx={{ height: 200, width: 320 }}>
      <ThemedScrollAreaStyles
        ref={hostRef}
      >
        <Box
          aria-label="Example scroll area"
          ref={viewportRef}
          role="region"
          sx={{ height: '100%', overflow: 'auto' }}
        >
          <Box sx={{ padding: 2, height: 650, width: 640 }}>
            Scroll vertically and horizontally to inspect the themed tracks.
          </Box>
        </Box>
      </ThemedScrollAreaStyles>
    </Box>
  );
}
