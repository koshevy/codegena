import type { GraphPayloadDirectoryNode } from '@codegena/graph-core';
import { NestedItemsCount } from '@codegena/ui-unified/counts';
import { FolderStateIcon } from '@codegena/ui-unified/icons';
import type { ReactElement, ReactNode } from 'react';

import {
  generatedFilesListDirectoryItemClasses,
  GeneratedFilesListDirectoryItemStyles,
} from './generated-files-list-directory-item.styles';
import {
  GeneratedFilesListExpandButtonStyles,
} from './generated-files-list-expand-button.styles';
import { stopPropagation } from './stop-propagation';

interface GeneratedFilesListDirectoryItemProps {
  children: ReactNode;
  contextMenuNodeId?: string;
  directory: GraphPayloadDirectoryNode;
  directoryCount: number;
  fileCount: number;
  isExpanded: boolean;
}

export function GeneratedFilesListDirectoryItem({
  children,
  contextMenuNodeId,
  directory,
  directoryCount,
  fileCount,
  isExpanded,
}: GeneratedFilesListDirectoryItemProps): ReactElement {
  const expandLabel = [
    isExpanded ? 'Collapse' : 'Expand',
    directory.data.relativeDirectoryPath,
  ].join(' ');

  const renderedLabel = (
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
  );

  return (
    <GeneratedFilesListDirectoryItemStyles
      data-context-menu-open={contextMenuNodeId === directory.id}
      data-node-id={directory.id}
      itemId={directory.id}
      label={renderedLabel}
      slotProps={{
        iconContainer: {
          'aria-label': expandLabel,
          'onClick': stopPropagation,
          'onKeyDown': stopPropagation,
        },
        groupTransition: { timeout: 0 },
      }}
      slots={{ iconContainer: GeneratedFilesListExpandButtonStyles }}
    >
      {children}
    </GeneratedFilesListDirectoryItemStyles>
  );
}
