import Box from '@mui/material/Box';
import {
  alpha,
  darken,
  lighten,
  styled,
} from '@mui/material/styles';

// language=postcss
export const JsonEditorStyles = styled(Box)(({ theme }) => `
  & {
    height: 100%;
  }

  /* Customize Monaco warning popup. */
  & .monaco-editor .monaco-resizable-hover {
    box-shadow: ${theme.shadows[3]};

    /* Common presets for Monaco's warning containers. */
    &,
    .monaco-hover,
    .monaco-scrollable-element,
    .monaco-hover-content,
    .hover-row {
      background: none;
      display: block;
      width: 100% !important;
      max-width: 100% !important;
      padding: 0 !important;
      border-radius: 0 !important;
      border: none !important;
    }

    & {
      background: ${alpha(lighten(theme.palette.primary.light, 0.9), 0.7)};
      backdrop-filter: blur(2px);
      min-width: 0 !important;
      width: auto !important;

      &:has(.hover-contents a.code-link[href*="codegena"]) {
        background: ${alpha(theme.palette.background.paper, 0.7)};
        width: calc(100% - 5rem) !important;
        border-left: 0.2rem solid ${lighten(theme.palette.warning.main, 0.2)} !important;
      }
    }

    .monaco-hover {
      font-family: ${theme.typography.fontFamily};
      position: relative;
      padding: 0 !important;
      overflow-wrap: anywhere;
      margin: 0 !important;
    }

    .hover-contents {
      display: flex;
      flex-direction: column;
      justify-content: stretch !important;
      padding: 0 !important;
    }

    .hover-contents > * {
      padding: 0.3rem 1.5rem 0.3rem 0.5rem;
      font-family: ${theme.typography.fontFamily};
      color: ${theme.palette.text.primary};
    }

    .hover-contents > :first-of-type {
      font-size: .9rem;
      font-weight: 500;
    }

    .hover-contents > :last-of-type {
      display: flex;
      flex-direction: row;
      gap: 0.5rem;
      background: ${alpha(theme.palette.background.default, 0.3)};
      opacity: 1 !important;

      a.code-link {
        margin: 0;

        /* Improve contrast on the yellow background. */
        color: ${darken(theme.palette.primary.main, 0.1)} !important;
        font-weight: 400;
        opacity: 1 !important;
        text-decoration: none;
        padding: 0.1rem 0.4rem;
        border-radius: ${theme.shape.borderRadius}px;

        &:hover {
          background: ${lighten(theme.palette.primary.light, 0.6)};
        }

        &::before,
        &::after {
          content: none !important;
        }

        > span {
          color: inherit !important;
          text-decoration: none;
        }
      }

      &:has([href*="codegena"]) {
        background: ${alpha(theme.palette.warning.light, 0.3)};
      }
    }

    .monaco-sash,
    .hover-copy-button,
    .hover-row.status-bar {
      display: none !important;
    }
  }
`);
