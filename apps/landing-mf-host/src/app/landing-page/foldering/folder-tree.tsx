import { GeneratedFilesList } from '@codegena/playground-ui/generated-files-list';
import type { ReactElement } from 'react';

import { FolderTreeStyles } from './folder-tree.styles';
import { onePasswordGeneratedFileTree } from './illustration.graph';

interface FolderTreeProps {
  expandedFileIds: string[];
  onExpandedFileIdsChange: (ids: string[]) => void;
}

export function FolderTree({
  expandedFileIds,
  onExpandedFileIdsChange,
}: FolderTreeProps): ReactElement {
  return (
    <FolderTreeStyles
      aria-label="Generated OnePassword folders"
      data-lenis-prevent
      role="region"
    >
      <GeneratedFilesList
        expandedFileIds={expandedFileIds}
        graph={onePasswordGeneratedFileTree}
        onExpandedFileIdsChange={onExpandedFileIdsChange}
      />
    </FolderTreeStyles>
  );
}
