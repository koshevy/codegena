import type { GraphPayloadLog } from '@codegena/graph-core';
import type { ReactElement } from 'react';

import {
  GeneratedFilesListDirectoryItem,
  GeneratedFilesListFileItem,
} from './items';
import type { GeneratedFilesTreeEntry } from './use-generated-files-tree';

interface GeneratedFilesListTreeEntriesProps {
  contextMenuNodeId?: string;
  entries: GeneratedFilesTreeEntry[];
  expandedItems: string[];
  onWarningClick: (nodeId: string, log: GraphPayloadLog) => void;
  shouldShowFullFilePath: boolean;
}

export function GeneratedFilesListTreeEntries({
  contextMenuNodeId,
  entries,
  expandedItems,
  onWarningClick,
  shouldShowFullFilePath,
}: GeneratedFilesListTreeEntriesProps): ReactElement {
  return (
    <>
      {entries.map((entry) => {
        if (entry.kind === 'directory') {
          const directoryCount = entry.children.filter((child) => (
            child.kind === 'directory'
          )).length;

          return (
            <GeneratedFilesListDirectoryItem
              contextMenuNodeId={contextMenuNodeId}
              directory={entry.directory}
              directoryCount={directoryCount}
              fileCount={entry.children.length - directoryCount}
              isExpanded={expandedItems.includes(entry.directory.id)}
              key={entry.directory.id}
            >
              <GeneratedFilesListTreeEntries
                contextMenuNodeId={contextMenuNodeId}
                entries={entry.children}
                expandedItems={expandedItems}
                onWarningClick={onWarningClick}
                shouldShowFullFilePath={shouldShowFullFilePath}
              />
            </GeneratedFilesListDirectoryItem>
          );
        }

        return (
          <GeneratedFilesListFileItem
            contextMenuNodeId={contextMenuNodeId}
            group={entry.group}
            isExpanded={expandedItems.includes(entry.group.id)}
            items={entry.items}
            key={entry.group.id}
            onWarningClick={onWarningClick}
            shouldShowFullFilePath={shouldShowFullFilePath}
            warning={entry.warning}
          />
        );
      })}
    </>
  );
}
