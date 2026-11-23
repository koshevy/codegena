import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const searchIllustrationClasses = {
  action: 'SearchIllustration__action',
} as const;

// language=postcss
export const SearchIllustrationStyles = styled(Box)(({ theme }) => `
  & {
    align-items: center;
    display: flex;
    justify-content: center;
    min-height: 28rem;
    position: relative;
  }

  & .MuiButton-root {
    background: ${theme.palette.info.dark};
    border-radius: 2px;
    color: ${theme.palette.info.contrastText};
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    padding: 0.95rem 1.45rem;
    position: relative;
    text-transform: uppercase;
    z-index: 1;
  }

  .${searchIllustrationClasses.action} {
    isolation: isolate;
    position: relative;
    z-index: 1;
  }

  & .MuiButton-root:hover {
    background: ${theme.palette.info.main};
  }

  @media (max-width: 700px) {
    & {
      min-height: 28svh;
      translate: 0 18svh;
    }

    & .MuiButton-root {
      max-width: 12rem;
    }
  }

  @media (max-width: 700px) and (max-height: 600px) {
    & {
      translate: 0 22svh;
    }

    & .MuiButton-root {
      max-width: 11rem;
    }
  }
`);
