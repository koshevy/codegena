import { alpha, styled } from '@mui/material/styles';
import { motion } from 'motion/react';

export const progressBlobClasses = {
  paused: 'ProgressBlob__paused',
  shader: 'ProgressBlob__shader',
} as const;

// Explicit percentages keep createShader from replacing CSS sizing with scaled pixels.
export const progressBlobCanvasStyle = { height: '100%', width: '100%' } as const;

// language=postcss
export const ProgressBlobStyles = styled(motion.div)(({
  theme,
}) => `
  & {
    height: clamp(9rem, 18vw, 14rem);
    left: 50%;
    pointer-events: none;
    position: absolute;
    top: 0;
    translate: -50% -50%;
    width: clamp(9rem, 18vw, 14rem);
    z-index: 0;
  }

  &::before {
    background: radial-gradient(
      ellipse at 34% 29%,
      ${alpha(theme.palette.info.dark, 0.7)},
      ${alpha(theme.palette.info.main, 0.54)} 27%,
      ${alpha(theme.palette.secondary.main, 0.4)} 62%,
      transparent 84%
    );
    animation: progressBlobMorph 5s ease-in-out infinite alternate;
    border-radius: 22% 78% 35% 65% / 45% 27% 73% 55%;
    content: '';
    filter: blur(12px);
    inset: 0;
    position: absolute;
  }

  &[data-has-shader='true']::before {
    opacity: 0.12;
  }

  .${progressBlobClasses.shader} {
    animation: progressBlobMorph 5s ease-in-out infinite alternate;
    border-radius: 22% 78% 35% 65% / 45% 27% 73% 55%;
    display: block;
    filter: blur(8px);
    height: 100%;
    overflow: hidden;
    position: relative;
    width: 100%;
  }

  &.${progressBlobClasses.paused}::before,
  &.${progressBlobClasses.paused} .${progressBlobClasses.shader} {
    animation-play-state: paused;
  }

  @keyframes progressBlobMorph {
    to {
      border-radius: 65% 35% 73% 27% / 58% 69% 31% 42%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &::before,
    .${progressBlobClasses.shader} {
      animation: none;
    }
  }
`);
