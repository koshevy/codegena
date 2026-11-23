import Box from '@mui/material/Box';
import { alpha, darken, emphasize, styled } from '@mui/material/styles';

export const demoButtonClasses = {
  button: 'DemoButton__button',
  icon: 'DemoButton__icon',
  label: 'DemoButton__label',
} as const;

// language=postcss
export const DemoButtonStyles = styled(Box)(({ theme }) => {
  const unifiedUiTextColor = darken(theme.palette.secondary.onLight, 0.3);
  const unifiedUiBackgroundColor = emphasize(unifiedUiTextColor, 0.9);

  return `
  & {
    max-width: 100%;
    position: relative;
    width: fit-content;
  }

  &[data-has-click-cue='true'] {
    z-index: 1;
  }

  .${demoButtonClasses.button} {
    background: ${alpha(unifiedUiBackgroundColor, 0.75)};
    border: 0;
    border-radius: 0.25rem;
    color: ${unifiedUiTextColor};
    font-size: 1.2rem;
    font-weight: 400;
    justify-content: flex-start;
    line-height: 1.25;
    max-width: 100%;
    outline: 0;
    padding: 0.85rem 1.2rem;
    text-align: left;
    text-transform: none;
    transform: scale(1);
    transition: box-shadow 180ms ease, transform 180ms ease;
    width: fit-content;
  }

  .${demoButtonClasses.button}:hover,
  .${demoButtonClasses.button}:focus {
    background: ${alpha(unifiedUiBackgroundColor, 0.75)};
    box-shadow: 0 1rem 2.5rem ${alpha(theme.palette.secondary.dark, 0.32)};
    transform: scale(1.05);
  }

  .${demoButtonClasses.button}:active {
    transform: scale(1);
  }

  .${demoButtonClasses.button} .MuiTouchRipple-child {
    background-color: ${alpha(theme.palette.secondary.dark, 0.65)};
  }

  &[data-zooming='true'] .${demoButtonClasses.button} {
    background: ${theme.palette.background.paper};
    box-shadow: none;
    transition: background-color 0.7s cubic-bezier(0.22, 1, 0.36, 1);
    transform: scale(1);
  }

  .${demoButtonClasses.button} .MuiButton-startIcon {
    margin-right: 0.75rem;
  }

  .${demoButtonClasses.icon} {
    align-items: center;
    display: inline-flex;
  }

  .${demoButtonClasses.button} svg {
    flex: none;
    height: 1.35rem;
    stroke-width: 1.5px;
    width: 1.35rem;
  }
  `;
});
