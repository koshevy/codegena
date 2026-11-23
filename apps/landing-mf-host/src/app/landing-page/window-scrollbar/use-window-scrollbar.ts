import { OverlayScrollbars } from 'overlayscrollbars';
import 'overlayscrollbars/overlayscrollbars.css';
import { useLayoutEffect } from 'react';

/**
 * Overlays the document scrollbar while keeping window as Lenis's scroll owner.
 * The body viewport option makes OverlayScrollbars use documentElement directly.
 */
export function useWindowScrollbar(): void {
  useLayoutEffect(() => {
    const scrollbar = OverlayScrollbars({
      target: document.body,
      elements: { viewport: document.body },
      cancel: { body: false },
    }, {
      scrollbars: {
        autoHide: 'move',
        autoHideDelay: 900,
        theme: 'os-theme-codegena-window',
      },
    });

    return () => scrollbar.destroy();
  }, []);
}
