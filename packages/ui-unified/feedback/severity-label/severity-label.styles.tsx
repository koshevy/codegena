import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

// language=postcss
export const SeverityLabelStyles = styled(Box)(({ theme }) => `
  & {
    align-items: center;
    display: flex;
    gap: ${theme.spacing(1)};
    min-width: 0;
    overflow-wrap: anywhere;
  }
`);
