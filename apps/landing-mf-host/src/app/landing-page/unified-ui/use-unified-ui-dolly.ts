import {
  useMotionValue,
  useTransform,
  type MotionProps,
  type MotionValue,
} from 'motion/react';
import type { RefObject } from 'react';
import { useCallback, useRef, useState } from 'react';
export interface UnifiedUiDollyTarget {
  origin: string;
  scale: number;
  specUrl: string;
  x: number;
  y: number;
}

interface UnifiedUiDolly {
  handleAnimationComplete: () => void;
  handleSelect: (specUrl: string, button: HTMLElement) => void;
  handleZoomUpdate: NonNullable<MotionProps['onUpdate']>;
  labelOpacity: MotionValue<number>;
  sceneRef: RefObject<HTMLDivElement | null>;
  target: UnifiedUiDollyTarget | null;
}

/**
 * Moves the whole preview toward the chosen button before opening its demo.
 */
export function useUnifiedUiDolly(
  onOpenExample: (specUrl: string) => void,
): UnifiedUiDolly {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [target, setTarget] = useState<UnifiedUiDollyTarget | null>(null);
  const zoomScale = useMotionValue(1);
  const labelOpacity = useTransform(zoomScale, [1, 3], [1, 0]);

  const handleSelect = useCallback((
    specUrl: string,
    element: HTMLElement,
  ): void => {
    const scene = sceneRef.current;

    if (!scene) {
      return;
    }

    const button = element.getBoundingClientRect();
    const bounds = scene.getBoundingClientRect();
    const centerX = button.left + button.width / 2;
    const centerY = button.top + button.height / 2;

    setTarget({
      origin: `${centerX - bounds.left}px ${centerY - bounds.top}px`,
      scale: Math.max(
        window.innerWidth / button.width,
        window.innerHeight / button.height,
      ) * 1.2,
      specUrl,
      x: window.innerWidth / 2 - centerX,
      y: window.innerHeight / 2 - centerY,
    });
  }, []);

  const handleAnimationComplete = useCallback((): void => {
    if (target) {
      onOpenExample(target.specUrl);
    }
  }, [
    onOpenExample,
    target,
  ]);

  const handleZoomUpdate = useCallback<NonNullable<MotionProps['onUpdate']>>(
    (latest): void => {
      const scale = latest['scale'];

      if (typeof scale === 'number') {
        zoomScale.set(scale);
      }
    },
    [zoomScale],
  );

  return {
    handleAnimationComplete,
    handleSelect,
    handleZoomUpdate,
    labelOpacity,
    sceneRef,
    target,
  };
}
