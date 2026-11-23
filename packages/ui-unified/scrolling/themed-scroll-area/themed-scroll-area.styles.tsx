import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

import { createScrollbarColors, scrollbarSize } from '../scrollbar-theme';

// language=postcss
export const ThemedScrollAreaStyles = styled(Box)(({ theme }) => {
  const colors = createScrollbarColors(theme);

  return `
  & {
    height: 100%;
    min-height: 0;
    min-width: 0;
    position: relative;
  }

  & .os-scrollbar.os-theme-codegena {
    --os-padding-perpendicular: 0;
    --os-track-border-radius: 0;
    --os-handle-border-radius: 0;
    --os-handle-bg: ${colors.normal};
    --os-handle-bg-hover: ${colors.hover};
    --os-handle-bg-active: ${colors.active};
    --os-handle-interactive-area-offset: 3px;
  }

  & .os-scrollbar.os-theme-codegena .os-scrollbar-track {
    box-shadow: inset 0 0 0 1px ${colors.trackBorder};
  }

  & .os-scrollbar-horizontal.os-theme-codegena {
    --os-size: ${scrollbarSize.horizontal}px;
  }

  & .os-scrollbar-vertical.os-theme-codegena {
    --os-size: ${scrollbarSize.vertical}px;
  }
`;
});
