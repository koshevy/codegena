import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

// language=postcss
export const DocumentationCodeBlockStyles = styled(Paper)(({ theme }) => `
  & {
    --code-editor-overlay-scrollbar-divider: none;

    border: 1px solid ${theme.palette.divider};
    border-radius: ${theme.shape.borderRadius}px;
    margin-bottom: 1rem;
    overflow: hidden;
  }
`);
