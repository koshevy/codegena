import { fontFamilies } from '@codegena/ui-theme';
import {
  getSiteHeaderCss,
  getSiteNavigationLinkCss,
} from '@codegena/ui-unified/branding';
import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/material/styles';

// language=postcss
export const DocumentationThemeStyles = styled(Box)(({ theme }) => `
  & {
    --documentation-max-width: 1376px;
    --ifm-color-primary: ${theme.palette.info.dark};
    --ifm-breadcrumb-color-active: ${theme.palette.info.dark};
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

    background:
      radial-gradient(
        ellipse at 10% 12rem,
        ${alpha(theme.palette.secondary.main, 0.18)},
        transparent 38rem
      ),
      radial-gradient(
        ellipse at 92% 32rem,
        ${alpha(theme.palette.primary.main, 0.08)},
        transparent 38rem
      ),
      radial-gradient(
        ellipse at 44% 62rem,
        ${alpha(theme.palette.info.main, 0.04)},
        transparent 42rem
      ),
      ${theme.palette.background.default};
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

  & .main-wrapper {
    margin-inline: auto;
    max-width: var(--documentation-max-width);
    width: 100%;
  }

  & .theme-doc-sidebar-container {
    border-right: 0;
  }

  & [aria-label='Docs sidebar'] {
    padding-right: 1rem;
  }

  & .table-of-contents__link {
    font-size: ${theme.typography.body1.fontSize};
  }

  & .pagination-nav__link.MuiButton-root {
    display: block;
    letter-spacing: normal;
    padding: var(--ifm-global-spacing);
    text-transform: none;
  }

  & .pagination-nav__label {
    color: ${theme.palette.text.primary};
    font-weight: 400;
  }

  & .pagination-nav__link--prev .pagination-nav__label::before {
    content: '« ' / '';
  }

  & .pagination-nav__link--next .pagination-nav__label::after {
    content: ' »' / '';
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
    transition: background-color 180ms ease, border-bottom-color 180ms ease;
  }

  & .navbar__inner {
    margin-inline: auto;
    max-width: var(--documentation-max-width);
  }

  &[data-header-scrolled='false'] .navbar {
    background-color: transparent;
    border-bottom-color: transparent;
  }

  /* A filtered navbar would confine its fixed drawer to the header height. */
  & .navbar::before {
    backdrop-filter: blur(4px);
    content: '';
    inset: 0;
    opacity: 1;
    pointer-events: none;
    position: absolute;
    transition: opacity 180ms ease;
    z-index: -1;
  }

  &[data-header-scrolled='false'] .navbar::before {
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    & .navbar,
    & .navbar::before {
      transition: none;
    }
  }

  & .navbar__link {
    ${getSiteNavigationLinkCss(theme)}
  }

  & .navbar__link:hover,
  & .navbar__link:focus-visible,
  & .navbar__link--active {
    color: ${theme.palette.info.dark};
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
