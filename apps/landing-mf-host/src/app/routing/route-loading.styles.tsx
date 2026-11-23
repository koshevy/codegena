import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';

// language=postcss
export const RouteLoadingStyles = styled(Stack)(({ theme }) => `
  align-items: center;
  background: ${theme.palette.background.paper};
  color: ${theme.palette.text.secondary};
  gap: ${theme.spacing(2)};
  justify-content: center;
  min-height: 100svh;
`);
