import { listClasses } from '@mui/material/List';
import Menu from '@mui/material/Menu';
import { styled } from '@mui/material/styles';

export const contextMenuClasses = {
  header: 'ContextMenu__header',
} as const;

// language=postcss
export const ContextMenuStyles = styled(Menu)(({ theme }) => `
  & .MuiPaper-root {
    max-height: min(360px, 60vh);
    max-width: min(320px, calc(100vw - 32px));
    padding: ${theme.spacing(0.5)};
    user-select: none;
  }

  & .${contextMenuClasses.header} {
    color: ${theme.palette.text.secondary};
    display: block;
    padding: ${theme.spacing(0.5, 0)};
  }

  .${listClasses.root} {
    padding: ${theme.spacing(1)};
  }
`);
