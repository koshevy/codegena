import Drawer from '@mui/material/Drawer';
import { alpha, styled } from '@mui/material/styles';

// language=postcss
export const UnderConstructionStyles = styled(Drawer)(({ theme }) => `
  &.MuiModal-root {
    z-index: ${theme.zIndex.snackbar + 1};
  }

  & .MuiBackdrop-root {
    backdrop-filter: blur(16px);
    background-color: ${alpha(theme.palette.common.black, 0.3)};
  }

  & .MuiDrawer-paper {
    box-shadow: ${theme.shadows[6]};
  }

  & .MuiAlert-root {
    align-items: center;
    background-color: ${theme.palette.warning.lightSurface};
    border-bottom: 1px solid ${theme.palette.warning.border};
    border-radius: 0;
    box-sizing: border-box;
    color: ${theme.palette.warning.contrastText};
    font-size: 0.875rem;
    line-height: 1.2;
    min-height: 2.5rem;
    padding: 0.5rem clamp(0.65rem, 2vw, 1.5rem);
  }

  & .MuiAlert-root .MuiAlert-icon {
    color: ${theme.palette.warning.contrastText};
    margin-right: 0.6rem;
    opacity: 1;
    padding: 0;
  }

  & .MuiAlert-message {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
    padding: 0;
  }

  & .MuiAlert-action {
    align-items: center;
    margin: 0 0 0 0.6rem;
    padding: 0;
    white-space: nowrap;
  }

  & .MuiAlert-action :is(.Mui-focusVisible, :focus-visible) {
    outline-color: ${theme.palette.warning.contrastText};
  }

  @media (forced-colors: active) {
    & .MuiAlert-action :is(.Mui-focusVisible, :focus-visible) {
      outline-color: Highlight;
    }
  }
`);
