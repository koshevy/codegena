import { useSyncExternalStore } from 'react';

function subscribe(onScroll: () => void): () => void {
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  return () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  };
}

function isPastHeaderThreshold(): boolean {
  const { fontSize } = getComputedStyle(document.documentElement);
  const thresholdPixels = Number(fontSize.replace('px', ''));

  return window.scrollY >= thresholdPixels;
}

function isHeaderInitiallyScrolled(): boolean {
  return false;
}

export function useIsDocumentationHeaderScrolled(): boolean {
  return useSyncExternalStore(
    subscribe,
    isPastHeaderThreshold,
    isHeaderInitiallyScrolled,
  );
}
