import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/material/styles';

export const panelHeaderClasses = {
  actions: 'PanelHeader__actions',
  leading: 'PanelHeader__leading',
} as const;

// language=postcss
export const PanelHeaderStyles = styled(Box)(({ theme }) => `
  & {
    align-items: center;
    background-color: ${alpha(theme.palette.background.paper, 0.6)};
    box-shadow: ${theme.shadows[3]};
    display: flex;
    flex-wrap: nowrap;
    gap: 1rem;
    min-height: 45px;
    padding: ${theme.spacing(1, 3)};
    z-index: 1;
  }

  .${panelHeaderClasses.leading},
  .${panelHeaderClasses.actions} {
    align-items: center;
    display: flex;
    flex-shrink: 0;
    gap: 1rem;
    white-space: nowrap;
  }

  .${panelHeaderClasses.leading}:empty {
    display: none;
  }
`);
