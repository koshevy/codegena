import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/material/styles';

export const terminalImitatorClasses = {
  caption: 'TerminalImitator__caption',
  content: 'TerminalImitator__content',
  header: 'TerminalImitator__header',
  scrollHost: 'TerminalImitator__scrollHost',
  window: 'TerminalImitator__window',
} as const;

// language=postcss
export const TerminalImitatorStyles = styled(Box)(({ theme }) => `
  & {
    min-width: 0;
  }

  .${terminalImitatorClasses.window} {
    background: ${theme.palette.background.paper};
    border: 1px solid ${theme.palette.divider};
    border-radius: ${theme.shape.borderRadius}px;
    color: ${theme.palette.text.primary};
    display: flex;
    flex-direction: column;
    height: min(55svh, 32rem);
    overflow: hidden;
  }

  .${terminalImitatorClasses.header} {
    backdrop-filter: blur(4px);
    border-bottom: 1px solid ${theme.palette.divider};
    position: relative;
    z-index: 1;
  }

  .${terminalImitatorClasses.scrollHost} {
    flex: 1;
    height: auto;
  }

  .${terminalImitatorClasses.content} {
    background: ${theme.palette.background.paper};
    font-family: 'Ubuntu Mono', Menlo, monospace;
    font-size: clamp(0.72rem, 0.95vw, 0.82rem);
    height: 100%;
    line-height: 1.2;
    min-height: 0;
    overscroll-behavior: contain;
    overflow-x: auto;
    overflow-y: auto;
  }

  .${terminalImitatorClasses.caption} {
    margin: 1.5rem 0 0;
  }

  @media (max-width: 700px) {
    & {
      display: flex;
      flex-direction: column-reverse;
    }

    .${terminalImitatorClasses.window} {
      border-color: ${alpha(theme.palette.info.main, 0.38)};
      border-bottom: 0;
      border-radius: 16px 16px 0 0;
      height: 25svh;
    }

    &[data-drawer='true'] {
      height: 100%;
    }

    &[data-drawer='true'] .${terminalImitatorClasses.window} {
      background: ${alpha(theme.palette.background.paper, 0.78)};
      border: 0;
      height: 100%;
    }

    &[data-drawer='true'] .${terminalImitatorClasses.header} {
      background: ${alpha(theme.palette.background.paper, 0.5)};
      border: 1px solid ${alpha(theme.palette.info.main, 0.38)};
      border-radius: 16px 16px 0 0;
    }

    &[data-drawer='true'] .${terminalImitatorClasses.content} {
      background: transparent;
    }

    .${terminalImitatorClasses.content} {
      font-size: 0.65rem;
    }

    .${terminalImitatorClasses.caption} {
      margin: 0 0 1rem;
    }
  }
`);
