import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

// language=postcss
export const GraphSearchStyles = styled(Box)(() => `
  & {
    left: 50%;
    position: absolute;
    top: 0;
    transform: translateX(-50%);
    z-index: 4;
  }
`);
