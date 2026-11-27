import type { ReactFlowInstance } from '@xyflow/react';
import {
  type RefObject,
  useCallback,
  useLayoutEffect,
  useRef,
} from 'react';

interface PreserveGraphScreenPosition {
  canvasRef: RefObject<HTMLDivElement | null>;
  handleGraphInit: (instance: ReactFlowInstance) => void;
}

/**
 * Keeps graph content at the same screen position when a canvas resize moves it.
 */
export function usePreserveGraphScreenPosition(
  onGraphInit: (instance: ReactFlowInstance) => void,
): PreserveGraphScreenPosition {
  const canvasRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<ReactFlowInstance | null>(null);

  const handleGraphInit = useCallback((instance: ReactFlowInstance): void => {
    instanceRef.current = instance;
    onGraphInit(instance);
  }, [
    onGraphInit,
  ]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    let previousLeft = canvas.getBoundingClientRect().left;
    const observer = new ResizeObserver(() => {
      const currentLeft = canvas.getBoundingClientRect().left;
      const offset = previousLeft - currentLeft;

      previousLeft = currentLeft;

      if (offset === 0 || !instanceRef.current) {
        return;
      }

      const instance = instanceRef.current;
      const viewport = instance.getViewport();

      void instance.setViewport({
        ...viewport,
        x: viewport.x + offset,
      });
    });

    observer.observe(canvas);

    return () => observer.disconnect();
  }, []);

  return { canvasRef, handleGraphInit };
}
