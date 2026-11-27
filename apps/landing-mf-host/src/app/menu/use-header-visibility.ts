import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';

interface HeaderVisibility {
  headerRef: RefObject<HTMLElement | null>;
  isHeaderOutOfView: boolean;
}

/**
 * Reveals the navigation drawer control after the top menu leaves view.
 */
export function useHeaderVisibility(): HeaderVisibility {
  const headerRef = useRef<HTMLElement>(null);
  const [isHeaderOutOfView, setIsHeaderOutOfView] = useState(false);

  useEffect(() => {
    const header = headerRef.current;

    if (!header) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry) {
        setIsHeaderOutOfView(!entry.isIntersecting);
      }
    });

    observer.observe(header);

    return () => observer.disconnect();
  }, []);

  return { headerRef, isHeaderOutOfView };
}
