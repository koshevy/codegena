import Button from '@mui/material/Button';
import { motion } from 'motion/react';
import type { MouseEvent, ReactElement } from 'react';
import { useCallback } from 'react';

import { ClickCue } from '../click-cue';
import type {
  DemoButtonProps,
} from './demo-button.props';
import {
  demoButtonClasses,
  DemoButtonStyles,
} from './demo-button.styles';

export function DemoButton({
  choice,
  isZooming,
  labelOpacity,
  onSelect,
}: DemoButtonProps): ReactElement {
  const handleClick = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
    onSelect(choice.specUrl, event.currentTarget);
  }, [
    choice.specUrl,
    onSelect,
  ]);

  const Icon = choice.icon;

  const renderedIcon = (
    <motion.span
      className={demoButtonClasses.icon}
      style={{ opacity: labelOpacity }}
    >
      <Icon aria-hidden />
    </motion.span>
  );

  const hasToShowClickCue = choice.showClickCue && !isZooming;

  const renderedClickCue = hasToShowClickCue && (
    <ClickCue tone="dark" />
  );

  return (
    <DemoButtonStyles
      data-has-click-cue={hasToShowClickCue}
      data-zooming={isZooming}
    >
      <Button
        className={demoButtonClasses.button}
        onClick={handleClick}
        startIcon={renderedIcon}
        variant="contained"
      >
        <motion.span
          className={demoButtonClasses.label}
          style={{ opacity: labelOpacity }}
        >
          {choice.label}
        </motion.span>
      </Button>
      {renderedClickCue}
    </DemoButtonStyles>
  );
}
