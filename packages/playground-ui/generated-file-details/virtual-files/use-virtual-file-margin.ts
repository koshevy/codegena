import { type RefObject, useLayoutEffect, useState } from 'react';

interface VirtualFileMargin {
  scrollMargin: number;
  viewportRect: { height: number; width: number };
}

export function useVirtualFileMargin(
  listRef: RefObject<HTMLDivElement | null>,
  scrollElement: HTMLDivElement | null,
  scrollMode: 'element' | 'window',
  visibleItemCount: number,
): VirtualFileMargin {
  const [scrollMargin, setScrollMargin] = useState(0);
  const [viewportRect, setViewportRect] = useState({ height: 0, width: 0 });

  useLayoutEffect(() => {
    const list = listRef.current;
    const container = scrollElement;

    if (!list || !container) {
      return;
    }

    const updateMargin = (): void => {
      const listTop = list.getBoundingClientRect().top;

      const nextMargin = scrollMode === 'window'
        ? listTop + window.scrollY
        : listTop - container.getBoundingClientRect().top + container.scrollTop;

      setScrollMargin(nextMargin);
      setViewportRect((current) => {
        const height = scrollMode === 'window'
          ? window.innerHeight
          : container.clientHeight;

        const width = scrollMode === 'window'
          ? window.innerWidth
          : container.clientWidth;

        if (current.height === height && current.width === width) {
          return current;
        }

        return { height, width };
      });
    };

    updateMargin();

    const observer = new ResizeObserver(updateMargin);

    observer.observe(container);

    return () => observer.disconnect();
  }, [
    listRef,
    scrollElement,
    scrollMode,
    visibleItemCount,
  ]);

  return { scrollMargin, viewportRect };
}
