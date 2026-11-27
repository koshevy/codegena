import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

interface ClippedEdges {
  start: boolean;
  end: boolean;
}

interface PanelHeaderOverflow {
  clippedEdges: ClippedEdges;
  contentRef: RefObject<HTMLDivElement | null>;
  scrollRef: RefObject<HTMLDivElement | null>;
  updateClippedEdges: () => void;
}

export function usePanelHeaderOverflow(): PanelHeaderOverflow {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [clippedEdges, setClippedEdges] = useState<ClippedEdges>({
    start: false,
    end: false,
  });

  const updateClippedEdges = useCallback((): void => {
    const scrollElement = scrollRef.current;

    if (!scrollElement) {
      return;
    }

    const maxScrollLeft = Math.max(
      0,
      scrollElement.scrollWidth - scrollElement.clientWidth,
    );

    const isStart = scrollElement.scrollLeft > 1;
    const isEnd = scrollElement.scrollLeft < maxScrollLeft - 1;

    setClippedEdges((previous) => (
      previous.start === isStart && previous.end === isEnd
        ? previous
        : { start: isStart, end: isEnd }
    ));
  }, []);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    const contentElement = contentRef.current;

    if (!scrollElement || !contentElement) {
      return;
    }

    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(updateClippedEdges);

    resizeObserver?.observe(scrollElement);
    resizeObserver?.observe(contentElement);

    if (!resizeObserver) {
      window.addEventListener('resize', updateClippedEdges);
    }

    updateClippedEdges();

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateClippedEdges);
    };
  }, [updateClippedEdges]);

  return { clippedEdges, contentRef, scrollRef, updateClippedEdges };
}
