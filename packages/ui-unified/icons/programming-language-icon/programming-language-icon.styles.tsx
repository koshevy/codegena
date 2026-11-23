import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

// language=postcss
export const ProgrammingLanguageIconStyles = styled(Box)(({ theme }) => `
  & {
    align-items: center;
    border-radius: ${theme.shape.borderRadius}px;
    display: flex;
    flex-shrink: 0;
    justify-content: center;
    height: 1em;
    width: 1em;
  }

  svg {
    width: 100%;
    height: 100%;
  }
`);
