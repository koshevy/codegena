import Drawer from '@mui/material/Drawer';
import { alpha, styled } from '@mui/material/styles';

export const searchDrawerClasses = {
  root: 'SearchDrawer__root',
  search: 'SearchDrawer__search',
};

// language=postcss
export const SearchDrawerStyles = styled(Drawer)(
  ({ theme }) => `
  & {
    /* Search must remain clickable above an embedded application's modal. */
    z-index: ${theme.zIndex.modal + 1};
  }

  & .MuiBackdrop-root {
    backdrop-filter: blur(3px);
    background: linear-gradient(
      160deg,
      ${alpha(theme.palette.primary.dark, 0.38)},
      ${alpha(theme.palette.common.black, 0.5)}
    );
  }

  & .MuiDrawer-paper {
    background: radial-gradient(
      circle,
      ${alpha(theme.palette.background.paper, 0.8)} 63%,
      ${alpha(theme.palette.background.paper, 0.96)} 90%
    );
    border: 0;
    border-radius: 0 0 0.8rem 0.8rem;
    box-sizing: border-box;
    box-shadow: ${theme.shadows[16]};
    left: 50%;
    overflow: visible;
    padding: 0.5rem 0.5rem 0.55rem;
    right: auto;
    translate: -50% 0;
    width: min(50rem, calc(100% - 2rem));
  }

  & .${searchDrawerClasses.search} {
    min-width: 0;
  }

  & .MuiAutocomplete-paper {
    margin-top: ${theme.spacing(5)};
  }

  & .MuiOutlinedInput-root {
    background: ${alpha(theme.palette.primary.main, 0.04)};
    border-radius: ${theme.shape.borderRadius * 1.5}px;
    font-size: ${theme.typography.body2.fontSize};
    min-height: 2.75rem;
  }

  & .MuiOutlinedInput-notchedOutline {
    border-color: ${alpha(theme.palette.primary.main, 0.18)};
  }
`,
);
