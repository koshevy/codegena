import { styled } from '@mui/material/styles';

// language=postcss
export const CookieNoticeSlot = styled('div')`
  /* Docusaurus marks the navbar while its full-screen mobile drawer is open. */
  body:has(.navbar-sidebar--show) & {
    visibility: hidden;
  }
`;
