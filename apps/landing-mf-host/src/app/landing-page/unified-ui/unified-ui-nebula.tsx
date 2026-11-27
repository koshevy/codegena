import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { type MotionValue, useTransform } from 'motion/react';
import type { ReactElement } from 'react';
import { Nebula, Shader } from 'shaders/react';

import { useShader } from '../shader';
import {
  unifiedUiNebulaClasses,
  UnifiedUiNebulaStyles,
} from './unified-ui-nebula.styles';

interface UnifiedUiNebulaProps {
  isVisible: boolean;
  isZooming: boolean;
  progress: MotionValue<number>;
  revealProgress: number;
}

const cloudShape = {
  radius: 0.5,
  type: 'sphere3D',
} as const;

/**
 * Shows the gas inside a Nebula while keeping its sphere edge offscreen.
 */
export function UnifiedUiNebula({
  isVisible,
  isZooming,
  progress,
  revealProgress,
}: UnifiedUiNebulaProps): ReactElement {
  const theme = useTheme();
  const shouldReduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const opacity = useTransform(
    progress,
    [revealProgress, revealProgress + 0.08],
    [0, 1],
  );

  const {
    canRenderShader,
    handleShaderReady,
    handleShaderUnavailable,
    isShaderReady,
  } = useShader();

  const hasToShowShader = isVisible && isShaderReady;

  const renderedShader = canRenderShader && (
    <Shader
      className={unifiedUiNebulaClasses.shader}
      disableTelemetry
      onReady={handleShaderReady}
      onUnavailable={handleShaderUnavailable}
    >
      <Nebula
        billow={0.9}
        cavity={0.5}
        coreColor={theme.palette.info.main}
        density={1}
        dust={0.25}
        environment={0}
        gasColor={theme.palette.info.main}
        gasScale={0.9}
        glow={2}
        highlight={0}
        refraction={0}
        shape={cloudShape}
        speed={shouldReduceMotion ? 0 : 0.12}
        stars={0}
        veilColor={theme.palette.secondary.light}
      />
    </Shader>
  );

  return (
    <UnifiedUiNebulaStyles
      animate={{ scale: isZooming ? 1.8 : 1 }}
      aria-hidden
      style={{ opacity: hasToShowShader ? opacity : 0 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
      {renderedShader}
    </UnifiedUiNebulaStyles>
  );
}
