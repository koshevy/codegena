import Badge from '@mui/material/Badge';
import { useTheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import { BadgeAlert, FolderTree } from 'lucide-react';
import type { ReactElement } from 'react';

import {
  PlaygroundGeneratedFileDetailsDirectoryNoticeStyles,
} from './playground-generated-file-details-directory-notice.styles';

interface PlaygroundGeneratedFileDetailsDirectoryNoticeProps {
  onClick: () => void;
}

const explanation = [
  'Nested directories are hidden in "Show all".',
  'Click to switch to "Show selected".',
].join(' ');

const badgeAnchorOrigin = {
  horizontal: 'left',
  vertical: 'bottom',
} as const;

export function PlaygroundGeneratedFileDetailsDirectoryNotice({
  onClick,
}: PlaygroundGeneratedFileDetailsDirectoryNoticeProps): ReactElement {
  const theme = useTheme();

  return (
    <Tooltip
      describeChild
      title={explanation}
    >
      <PlaygroundGeneratedFileDetailsDirectoryNoticeStyles
        aria-label="Reveal nested directories in file details"
        color="warning"
        onClick={onClick}
        size="small"
      >
        <Badge
          anchorOrigin={badgeAnchorOrigin}
          badgeContent={(
            <BadgeAlert
              aria-hidden
              size="1.2rem"
              fill={theme.palette.warning.main}
              color={theme.palette.background.paper}
              strokeWidth={2}
            />
          )}
          color="warning"
          overlap="circular"
        >
          <FolderTree
            aria-hidden
            size={19}
            strokeWidth={1.5}
          />
        </Badge>
      </PlaygroundGeneratedFileDetailsDirectoryNoticeStyles>
    </Tooltip>
  );
}
