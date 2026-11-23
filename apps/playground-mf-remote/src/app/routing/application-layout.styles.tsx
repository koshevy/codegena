import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

// language=postcss
export const ApplicationLayoutStyles = styled(Box)(({ theme }) => `
  display: flex;
  flex-direction: column;
  height: 100dvh;

  nav {
    align-items: center;
    border-bottom: 1px solid ${theme.palette.divider};
    display: flex;
    flex-shrink: 0;
    gap: 1rem;
    padding: 0.5rem 1rem;
  }

  main {
    display: flex;
    flex: 1;
    min-height: 0;
  }

  main > * {
    height: 100%;
    min-height: 0;
    width: 100%;
  }
`);
