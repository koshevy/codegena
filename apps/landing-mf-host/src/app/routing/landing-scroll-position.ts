export const scrollRestorationStorageKey = 'react-router-scroll-positions';

export function hasSavedScrollPositions(): boolean {
  try {
    return sessionStorage.getItem(scrollRestorationStorageKey) !== null;
  }
  catch {
    return false;
  }
}
