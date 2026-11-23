import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

// language=postcss
export const LandingPageStyles = styled(Box)(({ theme }) => `
  & {
    background: ${theme.palette.background.default};
    color: ${theme.palette.text.primary};
    min-height: 100vh;
    overflow: clip;
  }

  * {
    box-sizing: border-box;
  }

  ::selection {
    background: ${theme.palette.info.main};
    color: ${theme.palette.info.contrastText};
  }
`);
