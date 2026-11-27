import clsx from 'clsx';
import { type MotionValue, useInView } from 'motion/react';
import type { ReactElement } from 'react';
import { useRef } from 'react';

import { useShader } from '../shader';
import {
  progressBlobClasses,
  progressBlobCanvasStyle,
  ProgressBlobStyles,
} from './progress-blob.styles';
import { useProgressBlobShader } from './use-progress-blob-shader';
import { useProgressPercent } from './use-progress-percent';

interface ProgressBlobProps {
  isPaused: boolean;
  scale: MotionValue<number> | number;
  sectionProgress: MotionValue<number>;
  shouldReduceMotion: boolean | null;
  verticalOffset: MotionValue<number> | MotionValue<string>;
}

/**
 * Tracks the active feature's scroll path down the centre of the stage.
 */
export function ProgressBlob({
  isPaused,
  scale,
  sectionProgress,
  shouldReduceMotion,
  verticalOffset,
}: ProgressBlobProps): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasApproachedViewport = useInView(canvasRef, { margin: '160px', once: true });
  const progressPercent = useProgressPercent(sectionProgress);

  const {
    canRenderShader,
    handleShaderReady,
    handleShaderUnavailable,
    isShaderReady,
  } = useShader();

  const canLoadShader = canRenderShader && hasApproachedViewport;

  useProgressBlobShader({
    canvasRef,
    isEnabled: canLoadShader,
    isPaused,
    onReady: handleShaderReady,
    onUnavailable: handleShaderUnavailable,
    shouldReduceMotion,
  });

  const hasReadyShader = canRenderShader && isShaderReady;

  const renderedShader = canRenderShader && (
    <canvas
      aria-hidden
      className={progressBlobClasses.shader}
      ref={canvasRef}
      style={progressBlobCanvasStyle}
    />
  );

  return (
    <ProgressBlobStyles
      aria-label="Current feature scroll progress"
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={progressPercent}
      className={clsx({ [progressBlobClasses.paused]: isPaused })}
      data-has-shader={hasReadyShader ? 'true' : 'false'}
      role="progressbar"
      style={{
        scale,
        y: verticalOffset,
      }}
    >
      {renderedShader}
    </ProgressBlobStyles>
  );
}
