import IconButton from '@mui/material/IconButton';
import { alpha, styled } from '@mui/material/styles';

export const toggleClasses = {
  detached: 'Toggle__detached',
  icon: 'Toggle__icon',
  open: 'Toggle__open',
} as const;

// language=postcss
export const ToggleStyles = styled(IconButton)(({ theme }) => `
  & {
    color: ${theme.palette.text.primary};
    display: none;
    height: 44px;
    pointer-events: auto;
    position: fixed;
    right: clamp(1.25rem, 3vw, 3rem);
    top: 16px;
    width: 44px;
    z-index: ${theme.zIndex.drawer + 1};
  }

  &.${toggleClasses.detached} {
    backdrop-filter: blur(16px) saturate(140%);
    background: linear-gradient(
      145deg,
      ${alpha(theme.palette.background.paper, 0.76)},
      ${alpha(theme.palette.background.default, 0.54)}
    );
    border: 1px solid ${alpha(theme.palette.common.white, 0.16)};
    border-radius: ${theme.shape.borderRadius}px;
    box-shadow: inset 0 1px ${alpha(theme.palette.common.white, 0.1)},
      0 8px 24px ${alpha(theme.palette.common.black, 0.24)};
    display: inline-flex;
    transition: border-color 180ms ease, box-shadow 180ms ease,
      color 180ms ease;
  }

  &.${toggleClasses.detached}:hover {
    border-color: ${alpha(theme.palette.info.dark, 0.58)};
    box-shadow: inset 0 1px ${alpha(theme.palette.common.white, 0.18)},
      0 0 20px ${alpha(theme.palette.info.dark, 0.18)};
    color: ${theme.palette.info.dark};
  }

  &.${toggleClasses.detached}:active {
    box-shadow: inset 0 0 14px ${alpha(theme.palette.info.dark, 0.24)},
      0 0 24px ${alpha(theme.palette.info.dark, 0.24)};
  }

  &.${toggleClasses.open} {
    background-color: transparent;
    border-radius: ${theme.shape.borderRadius}px;
    display: inline-flex;
    transition: background-color 180ms ease;
  }

  &.${toggleClasses.open}:hover {
    background-color: ${alpha(theme.palette.text.primary, 0.08)};
  }

  .${toggleClasses.icon} {
    display: block;
    height: 20px;
    position: relative;
    width: 20px;
  }

  .${toggleClasses.icon} span {
    background: currentColor;
    border-radius: 2px;
    height: 2px;
    left: 2px;
    position: absolute;
    transition: top 180ms ease, transform 180ms ease,
      width 180ms ease, box-shadow 180ms ease, opacity 180ms ease;
    width: 16px;
  }

  .${toggleClasses.icon} span:nth-of-type(1) { top: 4px; }
  .${toggleClasses.icon} span:nth-of-type(2) { top: 9px; }
  .${toggleClasses.icon} span:nth-of-type(3) { top: 14px; }

  &:active .${toggleClasses.icon} span:nth-of-type(1) { top: 6px; }
  &:active .${toggleClasses.icon} span:nth-of-type(3) { top: 12px; }

  &.${toggleClasses.detached}:active .${toggleClasses.icon} span {
    box-shadow: 0 0 8px ${theme.palette.info.dark};
  }

  &.${toggleClasses.open}
    .${toggleClasses.icon} span:first-of-type {
    top: 9px;
    transform: rotate(45deg);
  }

  &.${toggleClasses.open}
    .${toggleClasses.icon} span:nth-of-type(2) {
    opacity: 0;
  }

  &.${toggleClasses.open}
    .${toggleClasses.icon} span:last-of-type {
    top: 9px;
    transform: rotate(-45deg);
  }

  @media (max-width: 700px) {
    & { right: 1rem; }
  }

  @media (max-width: 1000px) {
    & {
      display: inline-flex;
    }
  }

  @media (max-width: 900px) {
    & { top: 12px; }
  }
`);
