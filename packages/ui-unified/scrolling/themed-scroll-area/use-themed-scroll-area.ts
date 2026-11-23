import { OverlayScrollbars } from 'overlayscrollbars';
import 'overlayscrollbars/overlayscrollbars.css';
import { type RefObject, useLayoutEffect } from 'react';

interface ThemedScrollAreaOptions {
  autoHide?: 'move' | 'never';
  enabled?: boolean;
}

export function useThemedScrollArea(
  hostRef: RefObject<HTMLElement | null>,
  viewportRef: RefObject<HTMLElement | null>,
  {
    autoHide = 'move',
    enabled = true,
  }: ThemedScrollAreaOptions = {},
): void {
  useLayoutEffect(() => {
    const host = hostRef.current;
    const viewport = viewportRef.current;

    if (!enabled || !host || !viewport) {
      return;
    }

    const instance = OverlayScrollbars({
      elements: { viewport },
      target: host,
    }, {
      scrollbars: {
        autoHide,
        autoHideDelay: 900,
        autoHideSuspend: true,
        theme: 'os-theme-codegena',
        visibility: 'auto',
      },
    });

    return () => instance.destroy();
  }, [
    autoHide,
    enabled,
    hostRef,
    viewportRef,
  ]);
}
