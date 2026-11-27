import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/material/styles';

// language=postcss
export const GeneratedFileDetailsDirectoryStyles = styled(Box)(({ theme }) => `
  & {
    align-items: center;
    border: 1px solid ${theme.palette.divider};
    border-radius: ${theme.shape.borderRadius}px;
    background-image: linear-gradient(
      315deg,
      ${alpha(theme.palette.background.paper, 0.2)},
      ${alpha(theme.palette.background.paper, 0.6)} 57%
    );
    min-height: ${theme.spacing(6)};
    width: 100%;
  }

  &:has(button:hover) {
    background-color: ${theme.palette.action.hover};
  }
`);
