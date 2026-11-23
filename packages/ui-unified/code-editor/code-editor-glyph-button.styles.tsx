import { styled } from '@mui/material/styles';

export const codeEditorGlyphButtonClasses = {
  noHoverBackground: 'CodeEditorGlyphButton__noHoverBackground',
};

// language=postcss
export const CodeEditorGlyphButtonStyles = styled('button')(({ theme }) => `
  & {
    align-items: center;
    background: transparent;
    border: 0;
    border-radius: ${theme.shape.borderRadius}px;
    color: ${theme.palette.secondary.main};
    cursor: pointer;
    display: flex;
    justify-content: center;
    margin-left: ${theme.spacing(1)};
    padding: 0;
    position: relative;
  }

  &:hover {
    background: ${theme.palette.action.hover};
  }

  &.${codeEditorGlyphButtonClasses.noHoverBackground}:hover {
    background: none;
  }

  &:focus-visible {
    outline: 2px solid ${theme.palette.primary.main};
    outline-offset: 1px;
  }
`);
