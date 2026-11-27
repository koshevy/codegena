import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const codeEditorClasses = {
  pending: 'CodeEditor__pending',
} as const;

// language=postcss
export const CodeEditorStyles = styled(Box)(({ theme }) => `
  & {
    user-select: text;
  }

  & .monaco-editor .sticky-line-number-inner {
    box-sizing: content-box;
  }

  & .monaco-scrollable-element > .scrollbar > .slider {
    border-radius: 0;
  }

  &.${codeEditorClasses.pending} .monaco-editor .view-line > span {
    color: ${theme.palette.secondary.main};
  }

  @supports (background-clip: text) {
    & .monaco-editor .view-line > span {
      background-image: linear-gradient(
        90deg,
        ${theme.palette.secondary.main} 0%,
        ${theme.palette.primary.main} 25%,
        ${theme.palette.secondary.main} 50%,
        ${theme.palette.primary.main} 75%,
        ${theme.palette.success.main} 100%
      );
      background-size: 200% 100%;
      background-clip: text;
    }

    & .monaco-editor .view-line span {
      -webkit-text-fill-color: currentcolor;
      transition: -webkit-text-fill-color 300ms ease-in;
    }

    &.${codeEditorClasses.pending} .monaco-editor .view-line > span {
      animation: codegena-code-text-shimmer 3s linear infinite;
    }

    &.${codeEditorClasses.pending} .monaco-editor .view-line span {
      -webkit-text-fill-color: transparent;
    }
  }

  @keyframes codegena-code-text-shimmer {
    from {
      background-position: 200% center;
    }

    to {
      background-position: -200% center;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &.${codeEditorClasses.pending} .monaco-editor .view-line > span {
      animation: none;
      background-image: none;
    }

    & .monaco-editor .view-line span {
      transition: none;
    }

    &.${codeEditorClasses.pending} .monaco-editor .view-line span {
      -webkit-text-fill-color: ${theme.palette.secondary.main};
    }
  }
`);
