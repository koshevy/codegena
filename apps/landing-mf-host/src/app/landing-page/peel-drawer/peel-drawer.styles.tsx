import Drawer from '@mui/material/Drawer';
import { alpha, styled } from '@mui/material/styles';

export const peelDrawerClasses = {
  content: 'PeelDrawer__content',
} as const;

// language=postcss
export const PeelDrawerStyles = styled(Drawer)(({ theme }) => `
  & .MuiBackdrop-root {
    backdrop-filter: blur(3px);
    background: linear-gradient(
      160deg,
      ${alpha(theme.palette.primary.light, 0.38)},
      ${alpha(theme.palette.common.black, 0.5)}
    );
  }

  & .MuiDrawer-paper {
    background: transparent;
    border: 0;
    border-radius: 16px 16px 0 0;
    box-shadow: none;
    height: 66.6667dvh;
    overflow: hidden;
  }

  & .${peelDrawerClasses.content} {
    height: 100%;
  }

  & .${peelDrawerClasses.content} > div {
    height: 100%;
  }
`);
