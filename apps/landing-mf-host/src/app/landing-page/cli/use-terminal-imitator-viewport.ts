import { useThemedScrollArea } from '@codegena/ui-unified/scrolling';
import type { RefObject, UIEvent } from 'react';
import { useCallback, useEffect, useRef } from 'react';

import { type TerminalImitatorFrame } from './get-terminal-imitator-frame';

interface TerminalImitatorViewport {
  contentRef: RefObject<HTMLDivElement | null>;
  handleScroll: (event: UIEvent<HTMLDivElement>) => void;
  scrollHostRef: RefObject<HTMLDivElement | null>;
}

/**
 * Keeps the visible end of the terminal in view as scroll reveals output.
 */
export function useTerminalImitatorViewport({
  hasGreeting,
  typedCommand,
  visibleOutputCount,
}: TerminalImitatorFrame): TerminalImitatorViewport {
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollHostRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  useThemedScrollArea(scrollHostRef, contentRef, { autoHide: 'never' });

  const handleScroll = useCallback((event: UIEvent<HTMLDivElement>): void => {
    const { clientHeight, scrollHeight, scrollTop } = event.currentTarget;

    isAtBottomRef.current = scrollHeight - scrollTop - clientHeight <= 8;
  }, []);

  const handleWheel = useCallback((event: WheelEvent): void => {
    if (event.ctrlKey) {
      return;
    }

    const content = contentRef.current;

    if (!content) {
      return;
    }

    const canScrollVertically = event.deltaY !== 0 && (event.deltaY < 0
      ? content.scrollTop > 0
      : content.scrollTop + content.clientHeight < content.scrollHeight - 1);

    const canScrollHorizontally = event.deltaX !== 0 && (event.deltaX < 0
      ? content.scrollLeft > 0
      : content.scrollLeft + content.clientWidth < content.scrollWidth - 1);

    if (!canScrollVertically && !canScrollHorizontally) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    content.scrollBy(event.deltaX, event.deltaY);
  }, []);

  useEffect(() => {
    const host = scrollHostRef.current;

    if (!host) {
      return;
    }

    host.addEventListener('wheel', handleWheel, { capture: true, passive: false });

    return () => host.removeEventListener('wheel', handleWheel, true);
  }, [handleWheel]);

  useEffect(() => {
    const content = contentRef.current;

    if (content && isAtBottomRef.current) {
      content.scrollTop = content.scrollHeight;
    }
  }, [
    hasGreeting,
    typedCommand,
    visibleOutputCount,
  ]);

  return { contentRef, handleScroll, scrollHostRef };
}
