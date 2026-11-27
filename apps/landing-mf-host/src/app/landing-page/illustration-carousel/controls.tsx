import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactElement } from 'react';

import {
  controlsClasses,
  ControlsStyles,
} from './controls.styles';
interface ControlsProps {
  count: number;
  bulletNoun: string;
  onNext: () => void;
  onPrevious: () => void;
  selectedIndex: number;
}

/**
 * Keeps carousel navigation available while slides move underneath it.
 */
export function Controls({
  count,
  bulletNoun,
  onNext,
  onPrevious,
  selectedIndex,
}: ControlsProps): ReactElement {
  return (
    <ControlsStyles>
      <Tooltip title="Previous example">
        <IconButton
          aria-label={`Previous ${bulletNoun}`}
          className={controlsClasses.arrow}
          onClick={onPrevious}
          size="small"
        >
          <ChevronLeft
            aria-hidden
            size={16}
          />
        </IconButton>
      </Tooltip>
      <Typography
        className={controlsClasses.position}
        component="span"
        variant="caption"
      >
        {selectedIndex + 1} / {count}
      </Typography>
      <Tooltip title="Next example">
        <IconButton
          aria-label={`Next ${bulletNoun}`}
          className={controlsClasses.arrow}
          onClick={onNext}
          size="small"
        >
          <ChevronRight
            aria-hidden
            size={16}
          />
        </IconButton>
      </Tooltip>
    </ControlsStyles>
  );
}
