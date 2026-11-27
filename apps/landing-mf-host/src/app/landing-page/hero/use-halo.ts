import { DevModeEnvContext } from '@codegena/util-dev-mode';
import { useTheme } from '@mui/material/styles';
import type { RefObject } from 'react';
import { useContext, useEffect, useRef } from 'react';

function scheduleHaloLoad(loadHalo: () => void): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const idleCallback = window.requestIdleCallback(loadHalo);

    return () => window.cancelIdleCallback(idleCallback);
  }

  const frame = window.requestAnimationFrame(loadHalo);

  return () => window.cancelAnimationFrame(frame);
}

/**
 * Mounts the optional WebGL halo behind the hero artwork.
 */
export function useHalo(canLoadHalo: boolean): RefObject<HTMLDivElement | null> {
  const { isTestingMode } = useContext(DevModeEnvContext);

  const haloRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  useEffect(() => {
    const element = haloRef.current;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (!canLoadHalo || !element || prefersReducedMotion || isTestingMode) {
      return;
    }

    let isDisposed = false;
    let effect: { destroy: () => void } | undefined;

    const cancelLoad = scheduleHaloLoad(() => {
      const canvas = element.ownerDocument.createElement('canvas');
      const attributes = { alpha: true, antialias: true };
      const context = canvas.getContext('webgl2', attributes)
        ?? canvas.getContext('webgl', attributes);

      if (!context) {
        return;
      }

      void Promise.all([
        import(/* webpackFetchPriority: "low" */ 'vanta/dist/vanta.halo.min'),
        import(/* webpackFetchPriority: "low" */ 'three'),
      ]).then(([{ default: HALO }, THREE]) => {
        if (isDisposed) {
          return;
        }

        effect = HALO({
          THREE,
          amplitudeFactor: 1.7,
          backgroundColor: Number.parseInt(
            theme.palette.background.default.slice(1),
            16,
          ),
          baseColor: Number.parseInt(theme.palette.secondary.main.slice(1), 16),
          color2: Number.parseInt(theme.palette.secondary.main.slice(1), 16),
          el: element,
          mouseControls: false,
          size: 2.4,
          speed: 0.35,
          touchControls: false,
        });
      }).catch(() => {
        // The CSS glow remains available when WebGL cannot initialize.
      });
    });

    return () => {
      isDisposed = true;
      cancelLoad();
      effect?.destroy();
    };
  }, [
    canLoadHalo,
    isTestingMode,
    theme.palette.background.default,
    theme.palette.secondary.main,
  ]);

  return haloRef;
}
