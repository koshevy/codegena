import { styled } from '@mui/material/styles';
import { motion } from 'motion/react';

// language=postcss
export const OrbitStyles = styled(motion.svg)(({ theme }) => `
  & {
    aspect-ratio: 1;
    height: auto;
    overflow: visible;
    pointer-events: none;
    position: absolute;
    width: min(36rem, 100%);
  }

  & text {
    fill: ${theme.palette.secondary.main};
    font-family: ${theme.typography.fontFamily};
    font-size: 1.9rem;
    font-weight: 600;
    letter-spacing: 0.015em;
    text-transform: uppercase;
    white-space: pre;
  }

  &[data-tone='warning'] text {
    fill: ${theme.palette.warning.main};
  }

  @media (max-width: 700px) {
    & {
      width: min(23rem, 84vw, 47svh);
    }
  }

  @media (max-width: 700px) and (max-height: 600px) {
    & {
      width: min(23rem, 84vw, 39svh);
    }
  }
`);
