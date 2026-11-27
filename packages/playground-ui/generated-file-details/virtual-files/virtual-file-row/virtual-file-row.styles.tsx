import { getRevealHighlightCss } from '@codegena/ui-unified/scrolling';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

// language=postcss
export const VirtualFileRowStyles = styled(Box)(({ theme }) => `
  &[data-details-row='warning'] {
    ${getRevealHighlightCss(theme)}
  }
`);
