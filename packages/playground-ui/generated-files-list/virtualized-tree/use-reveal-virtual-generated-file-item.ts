import type { ReactVirtualizer } from '@tanstack/react-virtual';
import { useCallback, useEffect, useRef } from 'react';

import { getVirtualTreeRowId, type VirtualTreeRow } from './flatten-visible-tree';

interface RevealVirtualGeneratedFileItemOptions {
  defaultSelectedNodeIds: string[];
  isActive: boolean;
  rows: VirtualTreeRow[];
  virtualizer: ReactVirtualizer<HTMLDivElement, Element>;
}

export function useRevealVirtualGeneratedFileItem({
  defaultSelectedNodeIds,
  isActive,
  rows,
  virtualizer,
}: RevealVirtualGeneratedFileItemOptions): (nodeId: string) => void {
  const previousSelectedIdsRef = useRef(defaultSelectedNodeIds);
  const locallySelectedIdRef = useRef<string | null>(null);
  const pendingRevealIdRef = useRef<string | null>(null);

  const markLocallySelected = useCallback((nodeId: string): void => {
    locallySelectedIdRef.current = nodeId;
    pendingRevealIdRef.current = null;
  }, []);

  useEffect(() => {
    const previousIds = previousSelectedIdsRef.current;
    const newlySelectedId = defaultSelectedNodeIds.find((id) => (
      !previousIds.includes(id)
    ));

    const selectedId = newlySelectedId
      ?? (defaultSelectedNodeIds.length === 1 ? defaultSelectedNodeIds[0] : null);

    previousSelectedIdsRef.current = defaultSelectedNodeIds;
    pendingRevealIdRef.current = isActive
      && selectedId !== locallySelectedIdRef.current
      ? selectedId
      : null;
    locallySelectedIdRef.current = null;
  }, [defaultSelectedNodeIds, isActive]);

  useEffect(() => {
    const selectedId = pendingRevealIdRef.current;

    if (!isActive || !selectedId) {
      return;
    }

    const index = rows.findIndex((row) => getVirtualTreeRowId(row) === selectedId);

    if (index !== -1) {
      virtualizer.scrollToIndex(index, { align: 'auto' });
      pendingRevealIdRef.current = null;
    }
  }, [defaultSelectedNodeIds, isActive, rows, virtualizer]);

  return markLocallySelected;
}
