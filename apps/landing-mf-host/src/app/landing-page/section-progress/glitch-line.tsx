import { CodegenaDarkTheme } from '@codegena/ui-theme';
import { type MotionValue, useTransform } from 'motion/react';
import type { ReactElement } from 'react';
import { Glitch, LinearGradient, Shader } from 'shaders/react';

import { useShader } from '../shader';
import { getBlobFullScaleSectionProgress } from './blob-growth';
import {
  glitchLineClasses,
  GlitchLineStyles,
} from './glitch-line.styles';

interface GlitchLineProps {
  isNarrow: boolean;
  progress: MotionValue<number>;
  shouldReduceMotion: boolean | null;
}

/**
 * Runs a narrow glitch band down the Unified UI section.
 */
export function GlitchLine({
  isNarrow,
  progress,
  shouldReduceMotion,
}: GlitchLineProps): ReactElement {
  const theme = CodegenaDarkTheme;
  const revealProgress = getBlobFullScaleSectionProgress();
  const viewportHeight = typeof window === 'undefined' ? 900 : window.innerHeight;
  const stageHeight = isNarrow ? viewportHeight : Math.max(viewportHeight, 720);

  const fullOpacityProgress = revealProgress
    + (60 / stageHeight) * (0.94 - revealProgress);

  const top = useTransform(progress, [revealProgress, 0.94], ['0%', '100%']);

  const opacity = useTransform(
    progress,
    [revealProgress, fullOpacityProgress, 0.94, 1],
    [0, 1, 1, 0],
  );

  const {
    canRenderShader,
    handleShaderUnavailable,
  } = useShader(!shouldReduceMotion);

  const renderedShader = canRenderShader && (
    <Shader
      className={glitchLineClasses.shader}
      disableTelemetry
      onUnavailable={handleShaderUnavailable}
    >
      <Glitch
        blockDensity={12}
        colorBarIntensity={0.45}
        intensity={0.95}
        mirrorAmount={0.3}
        rgbShift={7}
        scanlineIntensity={0.18}
        speed={1.4}
      >
        <LinearGradient
          colorA={theme.palette.info.dark}
          colorB={theme.palette.secondary.main}
        />
      </Glitch>
    </Shader>
  );

  return (
    <GlitchLineStyles
      aria-hidden
      data-testid="unified-ui-glitch-line"
      style={{ opacity, top }}
    >
      {renderedShader}
    </GlitchLineStyles>
  );
}
