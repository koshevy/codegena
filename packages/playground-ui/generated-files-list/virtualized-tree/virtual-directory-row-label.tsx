import { NestedItemsCount } from '@codegena/ui-unified/counts';
import { FolderStateIcon } from '@codegena/ui-unified/icons';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { type MouseEvent, type ReactElement, useCallback } from 'react';

import type { VirtualDirectoryRow } from './flatten-visible-tree';
import {
  generatedFilesListDirectoryItemClasses,
} from '../items/generated-files-list-directory-item.styles';
import {
  GeneratedFilesListExpandButtonStyles,
} from '../items/generated-files-list-expand-button.styles';

interface VirtualDirectoryRowLabelProps {
  isExpanded: boolean;
  onToggle: (id: string) => void;
  row: VirtualDirectoryRow;
}

export function VirtualDirectoryRowLabel({
  isExpanded,
  onToggle,
  row,
}: VirtualDirectoryRowLabelProps): ReactElement {
  const { children, directory } = row.entry;
  const directoryCount = children.filter((child) => (
    child.kind === 'directory'
  )).length;

  const fileCount = children.length - directoryCount;
  const expandLabel = [
    isExpanded ? 'Collapse' : 'Expand',
    directory.data.relativeDirectoryPath,
  ].join(' ');

  const handleToggle = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation();
    onToggle(directory.id);
  }, [directory.id, onToggle]);

  const ExpandIcon = isExpanded ? ChevronDown : ChevronRight;
  const renderedExpandIcon = (
    <ExpandIcon
      aria-hidden
      size="1.1rem"
    />
  );

  return (
    <>
      <GeneratedFilesListExpandButtonStyles
        aria-label={expandLabel}
        onClick={handleToggle}
        size="small"
      >
        {renderedExpandIcon}
      </GeneratedFilesListExpandButtonStyles>
      <span className={generatedFilesListDirectoryItemClasses.row}>
        <FolderStateIcon
          className={generatedFilesListDirectoryItemClasses.icon}
          isExpanded={isExpanded}
          size="1rem"
        />
        <span className={generatedFilesListDirectoryItemClasses.name}>
          {directory.data.label}
        </span>
        <NestedItemsCount
          className={generatedFilesListDirectoryItemClasses.description}
          items={[
            { count: directoryCount, singular: 'directory', plural: 'directories' },
            { count: fileCount, singular: 'file', plural: 'files' },
          ]}
        />
      </span>
    </>
  );
}
