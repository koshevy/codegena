import { fontFamilies } from '@codegena/ui-theme';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const controlsClasses = {
  arrow: 'Controls__arrow',
  position: 'Controls__position',
} as const;

// language=postcss
export const ControlsStyles = styled(Box)(({
  theme,
}) => `
  & {
    align-items: center;
    display: flex;
    gap: ${theme.spacing(0.5)};
  }

  .${controlsClasses.arrow} {
    color: ${theme.palette.text.primary};
  }

  .${controlsClasses.arrow}:hover {
    color: ${theme.palette.info.dark};
  }

  .${controlsClasses.position} {
    color: ${theme.palette.text.secondary};
    font-family: ${fontFamilies.mono};
    white-space: nowrap;
  }

`);
