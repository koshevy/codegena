import { OverlayScrollbars } from 'overlayscrollbars';
import 'overlayscrollbars/overlayscrollbars.css';
import { type RefObject, useLayoutEffect } from 'react';

export function useNotificationGroupScroll(
  hostRef: RefObject<HTMLElement | null>,
  viewportRef: RefObject<HTMLElement | null>,
  expanded: boolean | undefined,
): void {
  useLayoutEffect(() => {
    const host = hostRef.current;
    const viewport = viewportRef.current;

    if (!expanded || !host || !viewport) {
      return;
    }

    const instance = OverlayScrollbars({
      elements: { viewport },
      target: host,
    }, {
      overflow: { x: 'hidden' },
      scrollbars: {
        autoHide: 'move',
        autoHideDelay: 900,
        autoHideSuspend: true,
        theme: 'os-theme-codegena',
        visibility: 'auto',
      },
    });

    return () => instance.destroy();
  }, [expanded, hostRef, viewportRef]);
}
