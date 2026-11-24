import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

import { HostLink } from '../navigation';

// language=postcss
export const GetStartedStyles = styled(Button<typeof HostLink>)(({ theme }) => `
  & {
    border-color: transparent;
    border-radius: 2px;
    color: ${theme.palette.text.primary};
    flex-shrink: 0;
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    margin-left: 1rem;
    padding: 0.55rem 1.2rem;
    position: relative;
    text-transform: uppercase;
  }

  &::before {
    background: linear-gradient(
      90deg,
      ${theme.palette.info.dark},
      ${theme.palette.secondary.dark},
      ${theme.palette.primary.dark}
    );
    border-radius: inherit;
    content: '';
    inset: -1px;
    mask: linear-gradient(currentColor, currentColor) content-box,
      linear-gradient(currentColor, currentColor);
    mask-composite: exclude;
    opacity: 0.5;
    padding: 1px;
    pointer-events: none;
    position: absolute;
  }

  &:hover {
    border-color: transparent;
  }

  &:hover::before {
    opacity: 1;
  }

  &:focus-visible {
    outline: 2px solid ${theme.palette.info.dark};
    outline-offset: 3px;
  }

  @media (forced-colors: active) {
    &,
    &:hover {
      border-color: ButtonText;
    }
  }

  @media (max-width: 1000px) {
    & { display: none; }
  }
`);
