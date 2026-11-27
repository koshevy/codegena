import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type { ReactElement } from 'react';

import {
  playgroundConvertingPlaceholderClasses,
  PlaygroundConvertingPlaceholderStyles,
} from './playground-converting-placeholder.styles';

export function PlaygroundConvertingPlaceholder(): ReactElement {
  return (
    <PlaygroundConvertingPlaceholderStyles
      aria-label="Specification is converting"
      role="status"
    >
      <Box
        aria-hidden
        className={playgroundConvertingPlaceholderClasses.artwork}
      >
        <CircularProgress
          className={playgroundConvertingPlaceholderClasses.progress}
          size={48}
          thickness={2.5}
        />
      </Box>
      <Typography variant="body2">
        Specification is converting
      </Typography>
    </PlaygroundConvertingPlaceholderStyles>
  );
}
