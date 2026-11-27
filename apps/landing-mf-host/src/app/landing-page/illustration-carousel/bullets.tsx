import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import type { MouseEvent, ReactElement } from 'react';

import {
  bulletsClasses,
  BulletsStyles,
} from './bullets.styles';
import type {
  IllustrationSlide,
} from './illustration-slide';

interface BulletsProps {
  onGoTo: (event: MouseEvent<HTMLButtonElement>) => void;
  selectedIndex: number;
  slides: readonly IllustrationSlide[];
  bulletNoun: string;
}

/**
 * Shows the carousel position and lets readers choose an example directly.
 */
export function Bullets({
  onGoTo,
  selectedIndex,
  slides,
  bulletNoun,
}: BulletsProps): ReactElement {
  const renderedBullets = slides.map(({
    fileName,
    tooltipTitle,
  }, index) => (
    <Tooltip
      key={fileName}
      title={tooltipTitle}
    >
      <IconButton
        aria-current={selectedIndex === index ? 'true' : undefined}
        aria-label={`Show ${bulletNoun} ${index + 1}: ${fileName}`}
        className={bulletsClasses.button}
        onClick={onGoTo}
        size="small"
        value={index}
      >
        <Box
          className={bulletsClasses.bullet}
          component="span"
        />
      </IconButton>
    </Tooltip>
  ));

  return (
    <BulletsStyles
      aria-label={`Choose a ${bulletNoun}`}
      role="group"
    >
      {renderedBullets}
    </BulletsStyles>
  );
}
