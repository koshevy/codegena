import { styled } from '@mui/material/styles';

import { HostLink } from '../../navigation';

export const overlayLinkClasses = {
  action: 'OverlayLink__action',
  icon: 'OverlayLink__icon',
} as const;

// language=postcss
export const OverlayLinkStyles = styled(HostLink)(({ theme }) => `
  & {
    align-items: center;
    color: ${theme.palette.text.primary};
    display: inline-flex;
    font-size: clamp(1.5rem, 4vw, 2.25rem);
    font-weight: 300;
    gap: clamp(0.8rem, 1.5vw, 1.5rem);
    letter-spacing: -0.055em;
    line-height: 1.08;
    text-decoration: none;
    transition: color 180ms ease, transform 180ms ease;
  }

  &:hover,
  &:focus-visible {
    color: ${theme.palette.info.dark};
    transform: translateX(0.4rem);
  }

  .${overlayLinkClasses.icon} {
    align-items: center;
    color: inherit;
    display: inline-flex;
    flex: none;
    height: clamp(1.4rem, 2vw, 2rem);
    justify-content: center;
    width: clamp(1.4rem, 2vw, 2rem);
  }

  .${overlayLinkClasses.icon} svg {
    height: 100%;
    stroke-width: 1.5px;
    width: 100%;
  }

  &.${overlayLinkClasses.action} .${overlayLinkClasses.icon} {
    height: auto;
    width: auto;
  }

  &.${overlayLinkClasses.action} svg {
    height: 1em;
    width: 1em;
  }

  @media (max-width: 900px) {
    & { font-size: clamp(1.5rem, 6.5vw, 2.25rem); }
  }
`);
