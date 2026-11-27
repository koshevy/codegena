import { getSiteNavigationLinkCss } from '@codegena/ui-unified/branding';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

// language=postcss
export const LinksStyles = styled(Box)(({ theme }) => `
  & {
    align-items: center;
    display: flex;
    flex: 1;
    gap: clamp(0.8rem, 2vw, 2rem);
  }

  & a:not(.MuiButton-root) {
    ${getSiteNavigationLinkCss(theme)}
  }

  & a:hover,
  & a:focus-visible {
    color: ${theme.palette.info.dark};
  }

  @media (max-width: 1000px) {
    & { display: none; }
  }
`);
