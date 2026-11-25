import { fontFamilies } from '@codegena/ui-theme';
import { styled } from '@mui/material/styles';

// language=postcss
export const DocsInlineCode = styled('code')(({ theme }) => `
  & {
    background-color: ${theme.palette.action.hover};
    border: 0;
    border-radius: 0.35rem;
    box-decoration-break: clone;
    color: ${theme.palette.text.primary};
    font-family: ${fontFamilies.mono};
    font-size: 0.9em;
    overflow-wrap: anywhere;
    padding: 0.12em 0.35em;
  }
`);
