import { alpha, type Theme } from '@mui/material/styles';

export function getSiteHeaderCss(theme: Theme): string {
  return `
    align-items: center;
    background: ${alpha(theme.palette.background.default, 0.72)};
    border-bottom: 1px solid ${alpha(theme.palette.info.main, 0.13)};
    box-shadow: none;
    box-sizing: border-box;
    display: flex;
    gap: clamp(0.8rem, 2vw, 2rem);
    font-family: ${theme.typography.fontFamily};
    font-size: ${theme.typography.body1.fontSize};
    font-weight: 400;
    height: 76px;
    padding: 0 clamp(1.25rem, 4vw, 4.5rem);
  `;
}

export function getSiteNavigationLinkCss(theme: Theme): string {
  return `
    color: ${theme.palette.text.secondary};
    font-size: 0.76rem;
    font-weight: 400;
    letter-spacing: 0.08em;
    text-decoration: none;
    text-transform: uppercase;
    transition: color 180ms ease;
  `;
}
