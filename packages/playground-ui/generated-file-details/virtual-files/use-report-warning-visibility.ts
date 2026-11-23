import { useEffect } from 'react';

import type { VirtualFilesVirtualizer } from './virtual-files-virtualizer';

export function useReportWarningVisibility(
  virtualizer: VirtualFilesVirtualizer,
  firstWarningIndex: number,
  onWarningVisibilityChange: (isVisible: boolean) => void,
): void {
  const virtualItems = virtualizer.getVirtualItems();
  const scrollOffset = virtualizer.scrollOffset ?? 0;
  const viewportHeight = virtualizer.scrollRect?.height ?? 0;

  useEffect(() => {
    const viewportEnd = scrollOffset + viewportHeight;

    const hasVisibleWarning = virtualItems.some((item) => {
      if (item.index < firstWarningIndex || item.size === 0) {
        return false;
      }

      const visibleHeight = Math.min(item.end, viewportEnd)
        - Math.max(item.start, scrollOffset);

      return visibleHeight / item.size >= 0.6;
    });

    onWarningVisibilityChange(hasVisibleWarning);
  }, [
    firstWarningIndex,
    onWarningVisibilityChange,
    scrollOffset,
    viewportHeight,
    virtualItems,
  ]);
}
