import { alpha, styled } from '@mui/material/styles';
import { div as MotionDiv } from 'motion/react-m';

export const artworkClasses = {
  logo: 'Artwork__logo',
} as const;

// language=postcss
export const ArtworkStyles = styled(MotionDiv)(({ theme }) => `
  & {
    align-items: center;
    display: flex;
    height: min(25vw, 360px);
    justify-content: center;
    min-height: 220px;
    order: -1;
    position: relative;
    transform-origin: center top;
  }

  .${artworkClasses.logo} {
    display: block;
    filter: drop-shadow(0 0 55px ${alpha(theme.palette.secondary.main, 0.32)});
    height: 100%;
    max-height: 100%;
    max-width: min(40vw, 400px);
    position: relative;
    width: min(40vw, 400px);
  }

  @media (max-width: 900px) {
    & {
      height: min(38vw, 330px);
      min-height: 210px;
    }

    .${artworkClasses.logo} {
      max-width: min(58vw, 400px);
      width: min(58vw, 400px);
    }
  }

  @media (max-height: 1000px) {
    & {
      height: 280px;
    }
  }

  @media (max-height: 800px) {
    & {
      height: 180px;
      min-height: 0;
    }
  }

  @media (max-width: 520px) {
    & {
      height: 50vw;
      min-height: 140px;
    }

    .${artworkClasses.logo} {
      max-width: 68vw;
      width: 68vw;
    }
  }

  @media (max-width: 520px) and (max-height: 700px) {
    & {
      height: 130px;
      min-height: 0;
    }
  }
`);
