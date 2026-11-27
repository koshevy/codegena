import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/material/styles';

export const infographicsClasses = {
  capabilities: 'Infographics__capabilities',
  description: 'Infographics__description',
  heading: 'Infographics__heading',
  headingRow: 'Infographics__headingRow',
  halo: 'Infographics__halo',
  kicker: 'Infographics__kicker',
  pattern: 'Infographics__pattern',
} as const;

// language=postcss
export const InfographicsStyles = styled(Box)(({ theme }) => `
  & {
    --ideology-content-top: calc(100svh + 8rem);

    background: ${theme.palette.background.default};
    border-top: 1px solid ${theme.palette.divider};
    isolation: isolate;
    margin-top: -100svh;
    min-height: 780px;
    overflow: hidden;
    padding: var(--ideology-content-top) clamp(1.25rem, 6vw, 8rem) 10rem;
    position: relative;
    z-index: 0;
  }

  .${infographicsClasses.halo} {
    background: radial-gradient(
      ellipse 42% 48% at 50% 50%,
      ${alpha(theme.palette.info.main, 0.25)},
      ${alpha(theme.palette.secondary.main, 0.12)} 42%,
      transparent 100%
    );
    height: 100svh;
    left: 0;
    pointer-events: none;
    position: absolute;
    top: var(--ideology-content-top);
    transform-origin: center center;
    translate: 0 -50%;
    width: 100%;
    z-index: 0;
  }

  .${infographicsClasses.pattern} {
    background-color: ${theme.palette.info.light};
    inset: 0;
    mask-image: url('/assets/hero-contours.svg');
    mask-position: center bottom;
    mask-repeat: no-repeat;
    mask-size: cover;
    opacity: ${theme.palette.mode === 'light' ? 0.3 : 0.14};
    pointer-events: none;
    position: absolute;
    transform-origin: center bottom;
    z-index: 1;
  }

  .${infographicsClasses.headingRow} {
    align-items: start;
    display: grid;
    gap: 2rem;
    grid-template-columns: minmax(140px, 0.35fr) 1fr;
    padding-bottom: 4rem;
    position: relative;
    z-index: 2;
  }

  .${infographicsClasses.kicker} {
    color: ${theme.palette.info.dark};
    font-family: monospace;
    font-size: 0.75rem;
    letter-spacing: 0.18em;
    margin-top: 0.5rem;
  }

  .${infographicsClasses.heading} {
    color: ${theme.palette.text.primary};
    font-size: clamp(3.1rem, 5.5vw, 6.7rem);
    font-weight: 600;
    letter-spacing: -0.075em;
    line-height: 1.03;
    margin: 0;
  }

  .${infographicsClasses.description} {
    color: ${theme.palette.text.secondary};
    font-size: clamp(1rem, 1.35vw, 1.25rem);
    font-weight: 400;
    line-height: 1.6;
    margin: 1.5rem 0 0;
    max-width: 60rem;
  }

  .${infographicsClasses.capabilities} {
    list-style: none;
    margin: 0;
    padding: 0;
    position: relative;
    z-index: 2;
  }

  @media (max-width: 800px) {
    .${infographicsClasses.headingRow} {
      grid-template-columns: 1fr;
      padding-bottom: 3rem;
    }
  }
`);
