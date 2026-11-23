import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';

export const contextMenuEntryClasses = {
  icon: 'ContextMenuEntry__icon',
} as const;

// language=postcss
export const ContextMenuEntryStyles = styled(MenuItem)(({ theme }) => `
  & {
    gap: ${theme.spacing(1)};
    min-height: 34px;
    padding: ${theme.spacing(0.5, 1.5)};
    align-items: center;
  }

  & .${contextMenuEntryClasses.icon} {
    align-items: center;
    align-self: center;
    color: ${theme.palette.secondary.main};
    display: inline-flex;
    flex: 0 0 18px;
    height: 18px;
    place-content: center;
    width: 18px;
  }

  & .${contextMenuEntryClasses.icon} svg {
    height: 16px;
    stroke-width: 1.75px;
    width: 16px;
  }
`);
