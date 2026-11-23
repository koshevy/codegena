import Tooltip from '@mui/material/Tooltip';
import { Download, LoaderCircle } from 'lucide-react';
import type { ReactElement } from 'react';

import { DownloadAllButtonStyles } from './download-all-button.styles';

export interface DownloadAllButtonProps {
  isPending: boolean;
  onClick: () => void;
}

export function DownloadAllButton({
  isPending,
  onClick,
}: DownloadAllButtonProps): ReactElement {
  const Icon = isPending ? LoaderCircle : Download;
  const iconClassName = isPending ? 'DownloadAllButton__spinner' : undefined;

  const renderedIcon = (
    <Icon
      aria-hidden
      className={iconClassName}
      size={18}
    />
  );

  return (
    <Tooltip title="Download all files">
      <span>
        <DownloadAllButtonStyles
          aria-busy={isPending}
          aria-label="Download all files"
          disabled={isPending}
          onClick={onClick}
          size="small"
        >
          {renderedIcon}
        </DownloadAllButtonStyles>
      </span>
    </Tooltip>
  );
}
