import { getSiteHeaderCss } from '@codegena/ui-unified/branding';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const menuClasses = {
  mobileHint: 'Menu__mobileHint',
} as const;

// language=postcss
export const MenuStyles = styled(Box)(({ theme }) => `
  & {
    ${getSiteHeaderCss(theme)}
    justify-content: space-between;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    z-index: 10;
  }

  .${menuClasses.mobileHint} {
    color: ${theme.palette.text.secondary};
    display: none;
    flex: 1;
    letter-spacing: 0.1em;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    text-transform: uppercase;
    white-space: nowrap;
  }

  @media (max-width: 1000px) {
    & {
      gap: 0.5rem;
      padding-right: 4.75rem;
    }

    .${menuClasses.mobileHint} {
      display: block;
    }
  }

  @media (max-width: 900px) {
    & { height: 68px; }
  }
`);

// language=postcss
export const MenuFocusLayerStyles = styled(Box)(({ theme }) => `
  & {
    inset: 0;
    pointer-events: none;
    position: fixed;
    z-index: ${theme.zIndex.drawer};
  }
`);
