import { useTheme } from '@mui/material/styles';
import { useInView } from 'motion/react';
import type { RefObject } from 'react';
import { useEffect, useMemo, useRef } from 'react';
import type { ShaderInstance } from 'shaders/js';

import { createProgressBlobPreset } from './create-progress-blob-preset';

interface ProgressBlobShaderOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  isEnabled: boolean;
  isPaused: boolean;
  shouldReduceMotion: boolean | null;
  onReady: () => void;
  onUnavailable: () => void;
}

/**
 * Keeps one canvas renderer alive so pausing preserves its pixels and animation time.
 */
export function useProgressBlobShader({
  canvasRef,
  isEnabled,
  isPaused,
  onReady,
  onUnavailable,
  shouldReduceMotion,
}: ProgressBlobShaderOptions): void {
  const theme = useTheme();
  const isInView = useInView(canvasRef);
  const shouldPauseRendering = isPaused || !isInView;
  const readyShaderRef = useRef<ShaderInstance | null>(null);
  const shouldPauseRenderingRef = useRef(shouldPauseRendering);

  const preset = useMemo(() => createProgressBlobPreset(theme, shouldReduceMotion), [
    shouldReduceMotion,
    theme,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!isEnabled || !canvas) {
      return;
    }

    let isActive = true;
    let hasRenderedFrame = false;
    let shader: ShaderInstance | undefined;

    function handleFirstFrame(): void {
      if (!isActive) {
        return;
      }

      hasRenderedFrame = true;
      onReady();

      if (shader) {
        readyShaderRef.current = shader;

        if (shouldPauseRenderingRef.current) {
          shader.pause();
        }
      }
    }

    function handleShaderError(): void {
      const hasTerminalFailure = isActive && !!shader?.getFailureReason();

      if (hasTerminalFailure) {
        onUnavailable();
      }
    }

    void import(
      /* webpackChunkName: "landing-progress-blob" */
      './create-progress-blob-shader'
    ).then(({ createProgressBlobShader }) => {
      if (!isActive) {
        return;
      }

      return createProgressBlobShader(canvas, preset, {
        onReady: handleFirstFrame,
        onError: handleShaderError,
      });
    }).then((created) => {
      if (!created) {
        return;
      }

      if (!isActive) {
        created.destroy();
        return;
      }

      shader = created;

      if (created.getFailureReason()) {
        onUnavailable();
        return;
      }

      if (hasRenderedFrame) {
        readyShaderRef.current = created;

        if (shouldPauseRenderingRef.current) {
          created.pause();
        }
      }
    }).catch(() => {
      if (isActive) {
        onUnavailable();
      }
    });

    return () => {
      isActive = false;
      readyShaderRef.current = null;
      shader?.destroy();
    };
  }, [
    canvasRef,
    isEnabled,
    onReady,
    onUnavailable,
    preset,
  ]);

  useEffect(() => {
    shouldPauseRenderingRef.current = shouldPauseRendering;

    if (shouldPauseRendering) {
      readyShaderRef.current?.pause();
    }
    else {
      readyShaderRef.current?.resume();
    }
  }, [
    shouldPauseRendering,
  ]);
}
