import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { Files, Folders } from 'lucide-react';
import type { ReactElement } from 'react';

interface GeneratedOutputCountsProps {
  directoryCount: number;
  fileCount: number;
  showDirectoryCount: boolean;
}

export function GeneratedOutputCounts({
  directoryCount,
  fileCount,
  showDirectoryCount,
}: GeneratedOutputCountsProps): ReactElement {
  const fileNoun = fileCount === 1 ? 'file' : 'files';
  const directoryNoun = directoryCount === 1 ? 'directory' : 'directories';
  const fileTitle = `${fileCount} generated ${fileNoun} in this specification`;
  const directoryTitle = [
    directoryCount,
    'generated',
    directoryNoun,
    'in this specification',
  ].join(' ');
  const renderedDirectoryChip = showDirectoryCount && (
    <Tooltip
      title={directoryTitle}
    >
      <Chip
        aria-label={directoryTitle}
        icon={(
          <Folders
            aria-hidden
            size={14}
          />
        )}
        label={directoryCount}
        role="status"
        size="small"
        variant="outlined"
      />
    </Tooltip>
  );

  return (
    <Stack
      direction="row"
      spacing={1}
    >
      <Tooltip
        title={fileTitle}
      >
        <Chip
          aria-label={fileTitle}
          icon={(
            <Files
              aria-hidden
              size={14}
            />
          )}
          label={fileCount}
          role="status"
          size="small"
          variant="outlined"
        />
      </Tooltip>
      {renderedDirectoryChip}
    </Stack>
  );
}
