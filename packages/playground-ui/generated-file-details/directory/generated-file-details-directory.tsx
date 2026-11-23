import type { GraphPayloadDirectoryNode } from '@codegena/graph-core';
import { FileDetailsHeader } from '@codegena/ui-unified/files';
import { FolderStateIcon } from '@codegena/ui-unified/icons';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { type ReactElement, useCallback } from 'react';

import {
  GeneratedFileDetailsDirectoryStyles,
} from './generated-file-details-directory.styles';

interface GeneratedFileDetailsDirectoryProps {
  directory: GraphPayloadDirectoryNode;
  onSelect?: (directoryId: string) => void;
}

export function GeneratedFileDetailsDirectory({
  directory,
  onSelect,
}: GeneratedFileDetailsDirectoryProps): ReactElement {
  const tooltipTitle = onSelect
    ? `Click to fall into ${directory.data.relativeDirectoryPath}`
    : '';

  const handleSelect = useCallback((): void => {
    onSelect?.(directory.id);
  }, [
    directory.id,
    onSelect,
  ]);

  const renderedIcon = (
    <Tooltip title={tooltipTitle}>
      <Box component="span">
        <FolderStateIcon
          isExpanded={false}
          size={18}
        />
      </Box>
    </Tooltip>
  );

  return (
    <GeneratedFileDetailsDirectoryStyles>
      <FileDetailsHeader
        ariaLabel={`Select ${directory.data.relativeDirectoryPath} directory`}
        icon={renderedIcon}
        name={directory.data.relativeDirectoryPath}
        onSelect={onSelect ? handleSelect : undefined}
        tooltipTitle={tooltipTitle}
      />
    </GeneratedFileDetailsDirectoryStyles>
  );
}
