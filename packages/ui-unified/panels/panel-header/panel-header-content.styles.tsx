import Box from '@mui/material/Box';
import { dividerClasses } from '@mui/material/Divider';
import { alpha, styled } from '@mui/material/styles';

export const panelHeaderContentClasses = {
  afterTitle: 'PanelHeader__afterTitle',
  content: 'PanelHeader__content',
  contentInner: 'PanelHeader__contentInner',
  icon: 'PanelHeader__icon',
  scrollRegion: 'PanelHeader__scrollRegion',
  title: 'PanelHeader__title',
} as const;

// language=postcss
export const PanelHeaderContentStyles = styled(Box)(({ theme }) => `
  & {
    flex: 1 1 auto;
    min-width: 0;
    position: relative;
  }

  &[data-clipped-start='true']::before,
  &[data-clipped-end='true']::after {
    bottom: 0;
    content: '';
    pointer-events: none;
    position: absolute;
    top: 0;
    width: 14px;
    z-index: 1;
  }

  &[data-clipped-start='true']::before {
    box-shadow: inset 9px 0 9px -7px ${alpha(theme.palette.text.primary, 0.3)};
    left: 0;
  }

  &[data-clipped-end='true']::after {
    box-shadow: inset -9px 0 9px -7px ${alpha(theme.palette.text.primary, 0.3)};
    right: 0;
  }

  .${panelHeaderContentClasses.content} {
    overflow: auto hidden;
    scrollbar-width: none;
  }

  .${panelHeaderContentClasses.content}::-webkit-scrollbar {
    display: none;
  }

  .${panelHeaderContentClasses.contentInner} {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    width: max-content;
    white-space: nowrap;
  }

  .${panelHeaderContentClasses.icon},
  .${panelHeaderContentClasses.title},
  .${panelHeaderContentClasses.afterTitle} {
    display: flex;
    flex-shrink: 0;
    white-space: nowrap;
    align-content: center;
  }

  .${panelHeaderContentClasses.title} + .${panelHeaderContentClasses.afterTitle} {
    margin-left: 1rem;
  }

  .${dividerClasses.root} {
    &, & + * {
      margin-left: 0.6rem;
    }
  }
`);
