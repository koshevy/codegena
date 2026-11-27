import Drawer from '@mui/material/Drawer';
import { alpha, styled } from '@mui/material/styles';

export const cookieNoticeClasses = {
  actions: 'WeUseCookies__actions',
} as const;

// language=postcss
export const WeUseCookiesStyles = styled(Drawer)(({ theme }) => `
  & .MuiDrawer-paper {
    backdrop-filter: blur(4px);
    background: ${alpha(theme.palette.info.surface, 0.8)};
    border: 1px solid ${theme.palette.info.border};
    border-radius: 0.5rem;
    bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
    box-shadow: ${theme.shadows[6]};
    color: ${theme.palette.text.primary};
    display: grid;
    gap: 0.65rem;
    height: auto;
    left: auto;
    max-height: calc(100dvh - 2rem - env(safe-area-inset-bottom, 0px));
    max-width: 34rem;
    padding: 1.15rem 1.25rem;
    right: 1rem;
    width: calc(100% - 2rem);
    z-index: ${theme.zIndex.appBar};
  }

  & h2 {
    color: ${theme.palette.info.text};
    font-size: 1.15rem;
  }

  & .MuiLink-root:not(.MuiButton-root) {
    color: ${theme.palette.info.text};
    font-weight: 600;
  }

  & .${cookieNoticeClasses.actions} {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
    margin-top: 0.3rem;
  }

  & a.MuiLink-root:focus-visible {
    outline: 2px solid ${theme.palette.info.dark};
    outline-offset: 2px;
  }

  @media (width <= 520px) {
    & .MuiDrawer-paper {
      bottom: calc(0.55rem + env(safe-area-inset-bottom, 0px));
      padding: 0.85rem 0.9rem;
      right: 0.55rem;
      width: calc(100% - 1.1rem);
    }

    & .${cookieNoticeClasses.actions} .MuiButton-contained {
      flex: 1 0 auto;
    }
  }
`);
