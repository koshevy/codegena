import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const heroHeadingClasses = {
  original: 'HeroHeading__original',
  root: 'Hero__heading',
} as const;

// language=postcss
export const HeroHeadingStyles = styled(Box)(({ theme }) => `
  & {
    color: ${theme.palette.text.primary};
    font-size: clamp(1rem, 5.4vw, 4.5rem);
    font-weight: 600;
    letter-spacing: -0.075em;
    line-height: 0.98;
    margin: 0 0 0 calc(50% - 50vw);
    position: relative;
    width: 100vw;
  }

  .${heroHeadingClasses.original} {
    display: block;
    margin: auto;
    max-width: 900px;
  }

  @media (max-width: 700px) {
    & {
      font-size: 1.5rem;
    }
  }
`);
