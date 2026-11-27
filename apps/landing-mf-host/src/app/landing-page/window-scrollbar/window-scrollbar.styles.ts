import {
  createScrollbarColors,
  scrollbarSize,
} from '@codegena/ui-unified/scrolling';
import { type CSSObject, type Theme } from '@mui/material/styles';

/**
 * Themes only the document overlay; editor and inner scrollbars keep their owners.
 */
export function getWindowScrollbarStyles(theme: Theme): CSSObject {
  const colors = createScrollbarColors(theme);

  return {
    '.os-scrollbar.os-theme-codegena-window': {
      '--os-padding-perpendicular': 0,
      '--os-track-border-radius': 0,
      '--os-handle-border-radius': 0,
      '--os-handle-bg': colors.normal,
      '--os-handle-bg-hover': colors.hover,
      '--os-handle-bg-active': colors.active,
      'zIndex': theme.zIndex.drawer - 1,
    },
    '.os-theme-codegena-window .os-scrollbar-track': {
      boxShadow: `inset 0 0 0 1px ${colors.trackBorder}`,
    },
    '.os-scrollbar-vertical.os-theme-codegena-window': {
      '--os-size': `${scrollbarSize.vertical}px`,
    },
    '.os-scrollbar-horizontal.os-theme-codegena-window': {
      '--os-size': `${scrollbarSize.horizontal}px`,
    },
    '@media (max-width: 700px)': {
      '.os-scrollbar.os-theme-codegena-window': {
        display: 'none',
      },
    },
  };
}
