import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const terminalImitatorBodyClasses = {
  cursor: 'TerminalImitatorBody__cursor',
  greeting: 'TerminalImitatorBody__greeting',
  output: 'TerminalImitatorBody__output',
  prompt: 'TerminalImitatorBody__prompt',
  promptName: 'TerminalImitatorBody__promptName',
} as const;

// language=postcss
export const TerminalImitatorBodyStyles = styled(Box)(({ theme }) => `
  & {
    min-height: 100%;
    padding: 0.75rem;
  }

  .${terminalImitatorBodyClasses.prompt} {
    overflow-wrap: anywhere;
  }

  .${terminalImitatorBodyClasses.promptName} {
    color: ${theme.palette.info.dark};
  }

  .${terminalImitatorBodyClasses.cursor} {
    background: ${theme.palette.text.primary};
    display: inline-block;
    height: 1em;
    vertical-align: -0.15em;
    width: 0.55em;
  }

  .${terminalImitatorBodyClasses.greeting},
  .${terminalImitatorBodyClasses.output} {
    font: inherit;
    margin: 0.4rem 0 0;
    width: max-content;
  }

  .${terminalImitatorBodyClasses.greeting} {
    font-family: Menlo, Monaco, 'Courier New', monospace;
  }

  .${terminalImitatorBodyClasses.greeting} code,
  .${terminalImitatorBodyClasses.output} code {
    font: inherit;
  }

  .ansi-yellow-fg {
    color: ${theme.palette.warning.main};
  }

  .ansi-blue-fg {
    color: ${theme.palette.info.dark};
  }

  .ansi-bright-cyan-fg {
    color: ${theme.palette.info.main};
  }

  .ansi-bright-cyan-bg {
    background-color: ${theme.palette.info.dark};
  }

  .ansi-bright-magenta-fg {
    color: ${theme.palette.secondary.main};
  }

  .ansi-bright-black-fg {
    color: ${theme.palette.text.disabled};
  }

  .ansi-white-fg {
    color: ${theme.palette.text.primary};
  }

  .ansi-bold {
    font-weight: 700;
  }

  .ansi-dim {
    opacity: 0.5;
  }

`);
