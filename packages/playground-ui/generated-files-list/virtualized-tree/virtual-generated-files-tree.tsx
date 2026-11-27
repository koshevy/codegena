import type { GraphPayloadLog } from '@codegena/graph-core';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import type { GeneratedFilesTreeEntry } from '../use-generated-files-tree';
import { flattenVisibleTree, getVirtualTreeRowId } from './flatten-visible-tree';
import {
  useRevealVirtualGeneratedFileItem,
} from './use-reveal-virtual-generated-file-item';
import { VirtualGeneratedFilesTreeRow } from './virtual-generated-files-tree-row';
import { VirtualGeneratedFilesTreeStyles } from './virtual-generated-files-tree.styles';

interface VirtualGeneratedFilesTreeProps {
  contextMenuNodeId?: string;
  defaultSelectedNodeIds: string[];
  entries: GeneratedFilesTreeEntry[];
  expandedItems: string[];
  isActive: boolean;
  onSelect: (event: MouseEvent<HTMLElement>, nodeId: string) => void;
  onToggle: (nodeId: string) => void;
  onWarningClick: (nodeId: string, log: GraphPayloadLog) => void;
  rootRef: RefObject<HTMLDivElement | null>;
  selectedNodeIds: Set<string>;
  shouldShowFullFilePath: boolean;
}

export function VirtualGeneratedFilesTree({
  contextMenuNodeId,
  defaultSelectedNodeIds,
  entries,
  expandedItems,
  isActive,
  onSelect,
  onToggle,
  onWarningClick,
  rootRef,
  selectedNodeIds,
  shouldShowFullFilePath,
}: VirtualGeneratedFilesTreeProps): ReactElement {
  // TanStack's mutable virtualizer cannot be safely memoized by React Compiler.
  'use no memo';

  const rows = useMemo(() => (
    flattenVisibleTree(entries, expandedItems)
  ), [entries, expandedItems]);

  const pendingFocusIndexRef = useRef<number | null>(null);

  const getScrollElement = useCallback((): HTMLDivElement | null => (
    rootRef.current
  ), [rootRef]);

  // eslint-disable-next-line react-hooks/incompatible-library -- 'use no memo' above
  const virtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: (index) => rows[index]?.kind === 'declaration' ? 54 : 36,
    getItemKey: (index) => rows[index] ? getVirtualTreeRowId(rows[index]) : index,
    getScrollElement,
    overscan: 8,
  });

  const markLocallySelected = useRevealVirtualGeneratedFileItem({
    defaultSelectedNodeIds,
    isActive,
    rows,
    virtualizer,
  });

  const handleSelect = useCallback((
    event: MouseEvent<HTMLElement>,
    nodeId: string,
  ): void => {
    markLocallySelected(nodeId);
    onSelect(event, nodeId);
  }, [markLocallySelected, onSelect]);

  const handleKeyDown = useCallback((
    event: KeyboardEvent<HTMLElement>,
    index: number,
  ): void => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.currentTarget.click();
      return;
    }

    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
      return;
    }

    event.preventDefault();

    const nextIndex = Math.max(0, Math.min(
      rows.length - 1,
      index + (event.key === 'ArrowDown' ? 1 : -1),
    ));

    pendingFocusIndexRef.current = nextIndex;
    virtualizer.scrollToIndex(nextIndex, { align: 'auto' });
  }, [rows.length, virtualizer]);

  const virtualItems = virtualizer.getVirtualItems();

  useEffect(() => {
    const focusIndex = pendingFocusIndexRef.current;

    if (focusIndex === null) {
      return;
    }

    const focusedRow = rootRef.current?.querySelector<HTMLElement>(
      `[data-index="${focusIndex}"] [role="treeitem"]`,
    );

    if (focusedRow) {
      focusedRow.focus();
      pendingFocusIndexRef.current = null;
    }
  }, [rootRef, virtualItems]);

  const renderedRows = virtualItems.map((virtualItem) => {
    const row = rows[virtualItem.index];

    if (!row) {
      return null;
    }

    const rowId = getVirtualTreeRowId(row);

    return (
      <VirtualGeneratedFilesTreeRow
        contextMenuNodeId={contextMenuNodeId}
        index={virtualItem.index}
        isExpanded={expandedItems.includes(rowId)}
        isSelected={selectedNodeIds.has(rowId)}
        key={rowId}
        onKeyDown={handleKeyDown}
        measureElement={virtualizer.measureElement}
        onSelect={handleSelect}
        onToggle={onToggle}
        onWarningClick={onWarningClick}
        row={row}
        shouldShowFullFilePath={shouldShowFullFilePath}
        start={virtualItem.start}
      />
    );
  });

  return (
    <VirtualGeneratedFilesTreeStyles
      aria-label="Generated files"
      role="tree"
      style={{ height: virtualizer.getTotalSize() }}
    >
      {renderedRows}
    </VirtualGeneratedFilesTreeStyles>
  );
}
