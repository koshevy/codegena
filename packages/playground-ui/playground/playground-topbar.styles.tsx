import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/material/styles';

export const playgroundTopbarClasses = {
  actions: 'PlaygroundTopbar__actions',
} as const;

// language=postcss
export const PlaygroundTopbarStyles = styled(Box)(({ theme }) => `
  & {
    align-items: center;
    background: ${alpha(theme.palette.background.paper, 0.92)};
    box-shadow: ${theme.shadows[2]};
    display: flex;
    justify-content: space-between;
    min-height: 64px;
    padding: ${theme.spacing(1.1, 3)};
    z-index: 2;
  }

  .${playgroundTopbarClasses.actions} {
    align-items: center;
    display: flex;
    gap: ${theme.spacing(1.5)};
  }
`);
