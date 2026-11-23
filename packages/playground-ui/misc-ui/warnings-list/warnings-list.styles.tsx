import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

// language=postcss
export const WarningsListStyles = styled(Box)(({ theme }) => `
  & {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing(1)};
    min-width: 0;
    padding: 0 ${theme.spacing(2)} ${theme.spacing(2)};
  }
`);
