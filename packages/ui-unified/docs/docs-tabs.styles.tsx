import { styled } from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';

export const DocsTabPanelStyles = styled('div')({
  paddingBlock: '1rem',
});

// language=postcss
export const DocsTabsStyles = styled(Tabs)(({ theme }) => `
  & {
    border-bottom: 1px solid ${theme.palette.divider};
    min-height: 0;
  }

  & .MuiTabs-flexContainer {
    gap: 1.25rem;
  }

  & .MuiTab-root {
    color: ${theme.palette.text.secondary};
    font-size: inherit;
    font-weight: 500;
    min-height: 0;
    min-width: 0;
    padding: 0.75rem 0.25rem;
    text-transform: none;
  }

  & .MuiTab-root:hover,
  & .MuiTab-root.Mui-selected {
    color: ${theme.palette.info.dark};
  }

  & .MuiTab-root.Mui-focusVisible {
    outline: 2px solid ${theme.palette.info.dark};
    outline-offset: -2px;
  }

  & .MuiTabs-indicator {
    background-color: ${theme.palette.info.dark};
  }
`);
