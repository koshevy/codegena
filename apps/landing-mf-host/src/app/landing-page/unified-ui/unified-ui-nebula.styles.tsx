import { styled } from '@mui/material/styles';
import { motion } from 'motion/react';

export const unifiedUiNebulaClasses = {
  shader: 'UnifiedUiNebula__shader',
} as const;

// language=postcss
export const UnifiedUiNebulaStyles = styled(motion.div)(() => `
  & {
    height: min(60rem, 140vw);
    left: 50%;
    pointer-events: none;
    position: absolute;
    top: calc(50% + 7rem);
    translate: -50% -50%;
    width: min(60rem, 140vw);
    z-index: 0;
  }

  .${unifiedUiNebulaClasses.shader} {
    filter: brightness(1.4) saturate(1.5);
    height: 100%;
    mask-image: radial-gradient(circle closest-side, black 25%, transparent 85%);
    width: 100%;
  }

  @media (max-width: 700px) {
    & {
      height: 100%;
      top: 50%;
      width: 100%;
    }
  }
`);
