import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/material/styles';

export const overlayFooterClasses = {
  brand: 'OverlayFooter__brand',
  contact: 'OverlayFooter__contact',
  policies: 'OverlayFooter__policies',
} as const;

// language=postcss
export const OverlayFooterStyles = styled(Box)(({ theme }) => `
  & {
    align-items: end;
    display: grid;
    gap: 2rem;
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .${overlayFooterClasses.brand} {
    max-width: 100%;
  }

  .${overlayFooterClasses.contact} {
    align-items: flex-end;
    align-self: flex-end;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    text-align: right;
  }

  .${overlayFooterClasses.policies} {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    justify-content: flex-end;
  }

  .${overlayFooterClasses.policies} a {
    color: ${theme.palette.text.secondary};
    font-size: 0.75rem;
    text-decoration-color: ${alpha(theme.palette.info.main, 0.45)};
  }

  @media (max-width: 900px) {
    & { grid-template-columns: 1fr; }
    .${overlayFooterClasses.brand} { order: 1; }
  }
`);
