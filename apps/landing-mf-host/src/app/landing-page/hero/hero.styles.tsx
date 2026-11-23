import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/material/styles';

export const heroClasses = {
  bottomLine: 'Hero__bottomLine',
  content: 'Hero__content',
  pattern: 'Hero__pattern',
  halo: 'Hero__halo',
  stage: 'Hero__stage',
} as const;

// language=postcss
export const HeroStyles = styled(Box)(({ theme }) => `
  & {
    height: calc(100svh + 970px);
    position: relative;
  }

  .${heroClasses.stage} {
    align-items: center;
    background: radial-gradient(
      ellipse at 70% 42%,
      ${alpha(theme.palette.secondary.main, 0.12)},
      ${theme.palette.background.default} 58%
    );
    display: flex;
    flex-direction: column;
    gap: 1.3rem;
    isolation: isolate;
    justify-content: center;
    min-height: max(760px, 100svh);
    overflow: visible;
    padding: 7rem clamp(1.25rem, 4vw, 4.5rem) 6rem;
    position: sticky;
    top: 0;
  }

  .${heroClasses.stage}::after {
    background: radial-gradient(
      ellipse 95% 65% at 50% 65%,
      ${alpha(theme.palette.secondary.main, 0.09)},
      transparent 100%
    ), ${theme.palette.background.default};
    content: '';
    height: 100svh;
    left: 0;
    pointer-events: none;
    position: absolute;
    right: 0;
    top: 100%;
    z-index: -2;
  }

  .${heroClasses.pattern} {
    background: linear-gradient(
      135deg,
      ${theme.palette.info.light},
      ${theme.palette.primary.light},
      ${theme.palette.secondary.light}
    );
    inset: 0 0 -100svh;
    mask-image: url('/assets/hero-contours.svg');
    mask-position: center;
    mask-repeat: no-repeat;
    mask-size: cover;
    opacity: ${theme.palette.mode === 'light' ? 0.3 : 0.14};
    pointer-events: none;
    position: absolute;
    transform-origin: 50% 25%;
    z-index: -1;
  }

  .${heroClasses.halo} {
    height: calc(100% + 100svh);
    inset: 0;
    mask-image: radial-gradient(
      ellipse 68% 56% at 50% 25%,
      black,
      transparent
    );
    opacity: 0.14;
    pointer-events: none;
    position: absolute;
    transform-origin: 50% 25%;
    width: 100%;
    z-index: -1;
  }

  .${heroClasses.content} {
    max-width: 900px;
    position: relative;
    text-align: center;
    z-index: 1;
  }

  .${heroClasses.bottomLine} {
    bottom: 3rem;
    color: ${theme.palette.text.secondary};
    display: flex;
    font-family: monospace;
    font-size: 0.7rem;
    justify-content: space-between;
    left: clamp(1.25rem, 4vw, 4.5rem);
    letter-spacing: 0.14em;
    position: absolute;
    right: clamp(1.25rem, 4vw, 4.5rem);
    z-index: 2;
  }

  @media (max-width: 900px) {
    .${heroClasses.stage} {
      padding-bottom: 7rem;
      padding-top: 9rem;
    }
  }

  @media (max-height: 800px) {
    .${heroClasses.stage} {
      min-height: 100svh;
      padding-bottom: 4rem;
      padding-top: 4rem;
    }
  }

  @media (max-width: 700px) {
    & {
      height: calc(max(100svh, 54rem) + 970px);
    }

    .${heroClasses.bottomLine} {
      display: none;
    }
  }

  @media (max-width: 520px) {
    .${heroClasses.stage} {
      padding-top: 5rem;
    }
  }

  @media (max-width: 520px) and (max-height: 700px) {
    .${heroClasses.stage} {
      padding-bottom: 2rem;
      padding-top: 3rem;
    }
  }
`);
