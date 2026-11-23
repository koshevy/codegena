import { fontFamilies } from '@codegena/ui-theme';
import {
  getSiteHeaderCss,
  getSiteNavigationLinkCss,
} from '@codegena/ui-unified/branding';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

// language=postcss
export const DocumentationThemeStyles = styled(Box)(({ theme }) => `
  & {
    --ifm-color-primary: ${theme.palette.info.dark};
    --ifm-link-color: ${theme.palette.info.dark};
    --ifm-menu-color-active: ${theme.palette.info.dark};
    --ifm-background-color: ${theme.palette.background.default};
    --ifm-background-surface-color: ${theme.palette.background.paper};
    --ifm-font-color-base: ${theme.palette.text.primary};
    --ifm-font-color-secondary: ${theme.palette.text.secondary};
    --ifm-font-family-base: ${theme.typography.fontFamily};
    --ifm-font-family-monospace: ${fontFamilies.mono};
    --ifm-navbar-background-color: ${theme.palette.background.paper};
    --ifm-navbar-height: 76px;
    --ifm-menu-color: ${theme.palette.text.primary};
    --ifm-toc-border-color: ${theme.palette.divider};
    --ifm-code-background: ${theme.palette.background.paper};

    background: ${theme.palette.background.default};
    color: ${theme.palette.text.primary};
    display: flex;
    flex-direction: column;
    font-family: ${theme.typography.fontFamily};
    font-size: ${theme.typography.body1.fontSize};
    min-height: 100vh;
  }

  & h1 {
    font-size: ${theme.typography.h1.fontSize};
    font-weight: ${theme.typography.h1.fontWeight};
    line-height: ${theme.typography.h1.lineHeight};
  }

  & h2 {
    font-size: ${theme.typography.h2.fontSize};
    font-weight: ${theme.typography.h2.fontWeight};
  }

  & main a {
    color: ${theme.palette.info.dark};
  }

  & [aria-label='Docs sidebar'] {
    padding-right: 1rem;
  }

  & .table-of-contents__link {
    font-size: ${theme.typography.body1.fontSize};
  }

  & .pagination-nav__label {
    color: ${theme.palette.text.primary};
    font-weight: 400;
  }

  & .navbar__brand {
    margin-left: 0;
    padding: 0;
  }

  & .navbar__brand svg {
    width: 9.2rem;
  }

  & .navbar {
    ${getSiteHeaderCss(theme)}
    padding-inline: var(--ifm-navbar-padding-horizontal);
  }

  /* A filtered navbar would confine its fixed drawer to the header height. */
  & .navbar::before {
    backdrop-filter: blur(4px);
    content: '';
    inset: 0;
    pointer-events: none;
    position: absolute;
    z-index: -1;
  }

  & .navbar__link {
    ${getSiteNavigationLinkCss(theme)}
  }

  & .navbar__link:hover,
  & .navbar__link:focus-visible,
  & .navbar__link--active {
    color: ${theme.palette.info.main};
  }

  & .navbar__link--active {
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 0.4rem;
  }

  @media (width <= 900px) {
    & { --ifm-navbar-height: 68px; }
    & .navbar { height: 68px; }
  }
`);
