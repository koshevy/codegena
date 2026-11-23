import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactElement } from 'react';

import { ThemeChoice } from './theme-choice';
import {
  themeChoicesClasses,
  ThemeChoicesStyles,
} from './theme-choices.styles';

const choices = [
  { label: 'Dark', mode: 'dark' },
  { label: 'Light', mode: 'light' },
  { label: 'System', mode: 'system' },
] as const;

interface ThemeChoicesProps {
  onSelect: () => void;
}

export function ThemeChoices({ onSelect }: ThemeChoicesProps): ReactElement {
  const renderedChoices = choices.map(({ label, mode }) => (
    <ThemeChoice
      key={mode}
      label={label}
      mode={mode}
      onSelect={onSelect}
    />
  ));

  return (
    <ThemeChoicesStyles>
      <Typography component="h2">Theme</Typography>
      <Box
        aria-label="Theme"
        className={themeChoicesClasses.group}
        role="group"
      >
        {renderedChoices}
      </Box>
    </ThemeChoicesStyles>
  );
}
