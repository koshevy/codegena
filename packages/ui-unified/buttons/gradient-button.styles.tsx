import Button, { type ButtonTypeMap } from '@mui/material/Button';
import type { ExtendButtonBase } from '@mui/material/ButtonBase';
import { alpha, styled } from '@mui/material/styles';

type GradientButtonType = ExtendButtonBase<ButtonTypeMap<{
  size?: 'small' | 'large';
  variant: 'contained' | 'outlined';
}>>;

/**
 * Use a contained fill or outlined border, with a compact or large size.
 */
// language=postcss
export const GradientButton = styled(Button)(({ theme }) => `
  & {
    border-radius: 2px;
    font-size: 0.75rem;
    letter-spacing: 0.06em;
    padding: 0.5rem 0.8rem;
    text-transform: uppercase;
  }

  &.MuiButton-sizeLarge {
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    padding: 0.95rem 1.45rem;
  }

  &.MuiButton-contained.MuiButton-sizeLarge {
    font-weight: 700;
  }

  &.MuiButton-contained:not(.Mui-disabled) {
    /* Keep the original label readable over the alternate gradient. */
    --gradient-button-state-opacity: 0.25;

    background-image: linear-gradient(
      90deg,
      ${theme.palette.info.dark},
      ${theme.palette.primary.dark},
      ${theme.palette.secondary.dark}
    );
    color: ${theme.palette.info.contrastText};
    isolation: isolate;
  }

  &:not(.Mui-disabled)::before {
    border-radius: inherit;
    content: '';
    pointer-events: none;
    position: absolute;
    transition: opacity 300ms ease;
  }

  &.MuiButton-contained:not(.Mui-disabled)::before {
    background-image: linear-gradient(
      90deg,
      ${theme.palette.info.light},
      ${theme.palette.primary.light} 75%,
      ${theme.palette.secondary.light}
    );
    inset: 0;
    opacity: 0;
    z-index: -1;
  }

  &.MuiButton-outlined:not(.Mui-disabled) {
    background-color: transparent;
    border-color: transparent;
    color: ${theme.palette.text.primary};
    transition: background-color 300ms ease;
  }

  &.MuiButton-outlined:not(.Mui-disabled)::before {
    background: linear-gradient(
      90deg,
      ${theme.palette.info.dark},
      ${theme.palette.secondary.dark},
      ${theme.palette.primary.dark}
    );
    inset: -1px;
    mask: linear-gradient(currentcolor, currentcolor) content-box,
      linear-gradient(currentcolor, currentcolor);
    mask-composite: exclude;
    opacity: 0.65;
    padding: 1px;
  }

  @media (hover: hover) {
    &:not(.Mui-disabled):hover::before {
      opacity: var(--gradient-button-state-opacity, 1);
    }

    &.MuiButton-outlined:not(.Mui-disabled):hover {
      background-color: ${alpha(
        theme.palette.info.main,
        theme.palette.action.hoverOpacity,
      )};
    }
  }

  &:not(.Mui-disabled):active::before {
    opacity: var(--gradient-button-state-opacity, 1);
  }

  &.MuiButton-outlined:not(.Mui-disabled):active {
    background-color: ${alpha(
      theme.palette.info.main,
      theme.palette.action.selectedOpacity,
    )};
  }

  &:not(.Mui-disabled):active {
    transform: scale(0.98);
  }

  &.Mui-focusVisible,
  &:focus-visible {
    outline: 2px solid ${theme.palette.info.dark};
    outline-offset: 3px;
  }

  @media (forced-colors: active) {
    &.MuiButton-outlined:not(.Mui-disabled) {
      border-color: ButtonText;
    }

    &.Mui-focusVisible,
    &:focus-visible {
      outline-color: Highlight;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &.MuiButton-outlined:not(.Mui-disabled),
    &:not(.Mui-disabled)::before {
      transition: none;
    }
  }
`) as GradientButtonType;
