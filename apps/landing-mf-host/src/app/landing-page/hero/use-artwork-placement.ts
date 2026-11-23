import useMediaQuery from '@mui/material/useMediaQuery';
import { type RefObject, useLayoutEffect, useRef, useState } from 'react';

export function useArtworkPlacement(contentRef: RefObject<HTMLDivElement | null>): {
  artworkRef: RefObject<HTMLDivElement | null>;
  logoY: number;
} {
  const artworkRef = useRef<HTMLDivElement>(null);
  const [logoY, setLogoY] = useState(0);
  const isNarrowHeader = useMediaQuery('(max-width: 900px)');

  useLayoutEffect(() => {
    const artwork = artworkRef.current;
    const content = contentRef.current;

    if (!artwork || !content) {
      return;
    }

    const observer = new ResizeObserver(() => {
      const headerHeight = isNarrowHeader ? 68 : 76;
      const freeSpaceCenter = (headerHeight + content.offsetTop) / 2;
      const artworkCenter = artwork.offsetTop + artwork.offsetHeight / 2;

      setLogoY(freeSpaceCenter - artworkCenter);
    });

    observer.observe(artwork);
    observer.observe(content);

    if (artwork.offsetParent) {
      observer.observe(artwork.offsetParent);
    }

    return () => observer.disconnect();
  }, [
    contentRef,
    isNarrowHeader,
  ]);

  return { artworkRef, logoY };
}
