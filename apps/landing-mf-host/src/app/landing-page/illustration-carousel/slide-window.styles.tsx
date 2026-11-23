import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/material/styles';

export const slideWindowClasses = {
  window: 'SlideWindow__window',
  header: 'SlideWindow__header',
  slide: 'SlideWindow__slide',
  track: 'SlideWindow__track',
  viewport: 'SlideWindow__viewport',
} as const;

// language=postcss
export const SlideWindowStyles = styled(Box)(({ theme }) => `
  & { min-width: 0; }

  .${slideWindowClasses.viewport} {
    overflow: hidden;
  }

  .${slideWindowClasses.track} {
    display: flex;
    flex-direction: column;
    height: 100%;
    touch-action: pan-y pinch-zoom;
  }

  .${slideWindowClasses.slide} {
    flex: 0 0 100%;
    min-height: 0;
    min-width: 0;
  }

  &[data-variant='code'] .${slideWindowClasses.viewport} {
    height: var(--landing-code-editor-height, min(54vh, 34rem));
  }

  .${slideWindowClasses.window} {
    background: ${theme.palette.background.paper};
    border: 1px solid ${theme.palette.divider};
    border-radius: ${theme.shape.borderRadius}px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &[data-variant='foldering'] .${slideWindowClasses.window} {
    height: min(55svh, 32rem);
  }

  &[data-variant='foldering'] .${slideWindowClasses.viewport} {
    flex: 1;
    min-height: 0;
  }

  &[data-variant='foldering']
  .${slideWindowClasses.window}[data-kind='folder-tree']
  .${slideWindowClasses.viewport} {
    background: ${theme.palette.background.paper};
    position: relative;
    z-index: 1;
  }

  .${slideWindowClasses.header} {
    backdrop-filter: blur(4px);
    position: relative;
    z-index: 1;
  }
  @media (max-width: 700px) {
    & { --landing-code-editor-height: 30svh; display: flex; flex-direction: column; }

    .${slideWindowClasses.window} {
      border-color: ${alpha(theme.palette.info.main, 0.38)};
      border-radius: 16px 16px 0 0;
      border-bottom: 0;
    }

    &[data-variant='foldering'] .${slideWindowClasses.window} {
      height: 100%;
    }

    &[data-drawer='true'] {
      --landing-code-editor-height: calc(66.6667dvh - 3.5rem);
      height: 100%;
    }

    &[data-drawer='true'] .${slideWindowClasses.window} {
      background: ${alpha(theme.palette.background.paper, 0.78)};
      border: 0;
      height: 100%;
    }

    &[data-drawer='true'] .${slideWindowClasses.viewport} {
      backdrop-filter: blur(10px);
    }

    &[data-drawer='true'] .${slideWindowClasses.header} {
      background: ${alpha(theme.palette.background.paper, 0.5)};
      border: 1px solid ${alpha(theme.palette.info.main, 0.38)};
      border-radius: 16px 16px 0 0;
    }

    &[data-drawer='true'] {
      --code-editor-background: transparent;
    }
  }
`);

// language=postcss
export const SlidePreviewStyles = styled(Box)`
  @media (max-width: 700px) {

    &[data-variant='foldering'] {
      flex: 1;
      min-height: 0;
    }

    &[data-variant='foldering'] > div,
    &[data-variant='foldering']
    > div > [data-variant='foldering'] {
      height: 100%;
    }
  }
`;
