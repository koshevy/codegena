import { CodegenaDarkTheme } from '@codegena/ui-theme';
import { styled } from '@mui/material/styles';
import { motion } from 'motion/react';

export const glitchLineClasses = {
  shader: 'GlitchLine__shader',
} as const;

// language=postcss
export const GlitchLineStyles = styled(motion.div)(() => `
  & {
    background: linear-gradient(
      90deg,
      ${CodegenaDarkTheme.palette.info.dark},
      ${CodegenaDarkTheme.palette.secondary.main}
    );
    height: 6rem;
    left: 0;
    overflow: hidden;
    pointer-events: none;
    position: absolute;
    translate: 0 -50%;
    width: 100%;
    z-index: 1;
  }

  .${glitchLineClasses.shader} {
    height: 100%;
    width: 100%;
  }
`);
