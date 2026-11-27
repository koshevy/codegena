import Drawer from '@mui/material/Drawer';
import { styled } from '@mui/material/styles';

export const overlayClasses = {
  content: 'Overlay__content',
} as const;

// language=postcss
export const OverlayStyles = styled(Drawer)(({ theme }) => `
  .MuiDrawer-paper {
    background: ${theme.palette.background.paper};
    box-sizing: border-box;
    color: ${theme.palette.text.primary};
    height: 100dvh;
    overflow-y: auto;
    padding: clamp(1.5rem, 4vw, 4rem);
    pointer-events: auto;
    width: 100vw;
  }

  .${overlayClasses.content} {
    display: flex;
    flex-direction: column;
    min-height: 100%;
  }

  @media (max-width: 900px) {
    .MuiDrawer-paper { padding: 1.25rem; }
  }
`);
