import { styled } from '@mui/material/styles';
import { motion } from 'motion/react';

// language=postcss
export const ClickCueStyles = styled(motion.div)(({ theme }) => `
  & {
    bottom: -1.25rem;
    color: ${theme.palette.secondary.dark};
    mix-blend-mode: difference;
    pointer-events: none;
    position: absolute;
    right: -1rem;
    transform: rotate(-15deg);
    z-index: 2;
  }

  &[data-tone='dark'] {
    color: ${theme.palette.warning.main};
    mix-blend-mode: normal;
  }

`);
