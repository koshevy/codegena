import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

// language=postcss
export const PlaygroundSessionStyles = styled(Box)(({ theme }) => `
  background: ${theme.palette.background.paper};
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow: hidden;
  width: 100%;

  & > main {
    display: flex;
    flex: 1;
    min-height: 0;
  }

  & > main > * {
    min-height: 0;
    width: 100%;
  }
`);
