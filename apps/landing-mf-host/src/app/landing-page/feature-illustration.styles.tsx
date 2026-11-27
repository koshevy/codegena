import { alpha, styled } from '@mui/material/styles';
import { motion } from 'motion/react';

export const featureIllustrationClasses = {
  scene: 'FeatureIllustration__scene',
} as const;

// language=postcss
export const FeatureIllustrationStyles = styled(motion.div)(({
  theme,
}) => `
  & {
    min-width: 0;
    position: absolute;
    right: clamp(1.25rem, 3vw, 3rem);
    top: 14%;
    width: min(52vw, 800px);
    z-index: 1;
  }

  &::before {
    background: radial-gradient(
      circle,
      ${alpha(theme.palette.info.main, 0.3)},
      ${alpha(theme.palette.secondary.main, 0.12)} 48%,
      transparent 72%
    );
    border-radius: 50%;
    content: '';
    filter: blur(30px);
    height: 125%;
    left: -10%;
    position: absolute;
    top: -10%;
    width: 125%;
  }

  &[data-illustration='unified'] {
    isolation: isolate;
  }

  &[data-illustration='unified'] > .${featureIllustrationClasses.scene} {
    position: relative;
    z-index: 1;
  }

  @media (max-width: 700px) {
    & {
      bottom: 0;
      height: 32svh;
      overflow: clip;
      padding-inline: 1rem;
      right: 0;
      top: auto;
      width: 100%;
    }

    &[data-illustration='code'] {
      height: min(50svh, 23rem);
    }

    &[data-illustration='terminal'] {
      height: auto;
    }

    &[data-illustration='foldering'] {
      height: 42svh;
    }

    &[data-illustration='search'] {
      height: 58svh;
    }

    &[data-illustration='ide'] {
      height: 58svh;
    }

    &[data-illustration='unified'] {
      bottom: 3rem;
      height: auto;
    }

    &[data-illustration='foldering'] > div,
    &[data-illustration='search'] > div,
    &[data-illustration='ide'] > div {
      height: 100%;
    }
  }
`);
