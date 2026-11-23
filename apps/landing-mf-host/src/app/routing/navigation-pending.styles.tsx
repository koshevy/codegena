import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

// language=postcss
export const NavigationPending = styled(Box)(({ theme }) => `
  background: ${theme.palette.background.paper};
  inset: 0;
  position: fixed;
  z-index: ${theme.zIndex.modal};
`);

// language=postcss
export const NavigationCancelStyles = styled(Button)`
  bottom: 2rem;
  left: 50%;
  position: absolute;
  transform: translateX(-50%);
`;
