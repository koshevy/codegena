import { styled } from '@mui/material/styles';
import { TriangleAlert } from 'lucide-react';

// language=postcss
export const WarningIcon = styled(TriangleAlert)(({ theme }) => `
  & {
    color: ${theme.palette.warning.main};
  }

  button:hover & {
    color: ${theme.palette.warning.dark};
  }
`);
