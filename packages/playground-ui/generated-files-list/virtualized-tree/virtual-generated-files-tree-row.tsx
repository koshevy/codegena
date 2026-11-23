import type { GraphPayloadLog } from '@codegena/graph-core';
import {
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  useCallback,
} from 'react';

import { getVirtualTreeRowId, type VirtualTreeRow } from './flatten-visible-tree';
import { VirtualDeclarationRowLabel } from './virtual-declaration-row-label';
import { VirtualDirectoryRowLabel } from './virtual-directory-row-label';
import { VirtualFileRowLabel } from './virtual-file-row-label';
import { virtualGeneratedFilesTreeClasses } from './virtual-generated-files-tree.styles';

interface VirtualGeneratedFilesTreeRowProps {
  contextMenuNodeId?: string;
  index: number;
  isExpanded: boolean;
  isSelected: boolean;
  onKeyDown: (event: KeyboardEvent<HTMLElement>, index: number) => void;
  measureElement: (element: Element | null) => void;
  onSelect: (event: MouseEvent<HTMLElement>, nodeId: string) => void;
  onToggle: (nodeId: string) => void;
  onWarningClick: (nodeId: string, log: GraphPayloadLog) => void;
  row: VirtualTreeRow;
  shouldShowFullFilePath: boolean;
  start: number;
}

export function VirtualGeneratedFilesTreeRow({
  contextMenuNodeId,
  index,
  isExpanded,
  isSelected,
  onKeyDown,
  measureElement,
  onSelect,
  onToggle,
  onWarningClick,
  row,
  shouldShowFullFilePath,
  start,
}: VirtualGeneratedFilesTreeRowProps): ReactElement {
  const nodeId = getVirtualTreeRowId(row);

  const handleClick = useCallback((event: MouseEvent<HTMLElement>): void => {
    onSelect(event, nodeId);
  }, [nodeId, onSelect]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLElement>): void => {
    onKeyDown(event, index);
  }, [index, onKeyDown]);

  const renderedDirectoryLabel = row.kind === 'directory' && (
    <VirtualDirectoryRowLabel
      isExpanded={isExpanded}
      onToggle={onToggle}
      row={row}
    />
  );

  const renderedFileLabel = row.kind === 'file' && (
    <VirtualFileRowLabel
      isExpanded={isExpanded}
      onToggle={onToggle}
      onWarningClick={onWarningClick}
      row={row}
      shouldShowFullFilePath={shouldShowFullFilePath}
    />
  );

  const renderedDeclarationLabel = row.kind === 'declaration' && (
    <>
      <span
        aria-hidden
        style={{ flex: '0 0 1.4rem' }}
      />
      <VirtualDeclarationRowLabel
        onWarningClick={onWarningClick}
        row={row}
      />
    </>
  );

  return (
    <div
      className={virtualGeneratedFilesTreeClasses.row}
      data-context-menu-open={contextMenuNodeId === nodeId}
      data-index={index}
      data-node-id={nodeId}
      ref={measureElement}
      style={{ transform: `translateY(${start}px)` }}
    >
      <div
        aria-expanded={row.kind === 'declaration' ? undefined : isExpanded}
        aria-level={row.depth + 1}
        aria-selected={isSelected}
        className={virtualGeneratedFilesTreeClasses.content}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="treeitem"
        style={{ paddingLeft: `${row.depth}rem` }}
        tabIndex={0}
      >
        {renderedDirectoryLabel}
        {renderedFileLabel}
        {renderedDeclarationLabel}
      </div>
    </div>
  );
}
