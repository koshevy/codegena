import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import type { LucideIcon } from 'lucide-react';
import type { ReactElement } from 'react';

interface GeneratedFileDetailsFileActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}

export function GeneratedFileDetailsFileActionButton({
  icon: Icon,
  label,
  onClick,
}: GeneratedFileDetailsFileActionButtonProps): ReactElement {
  return (
    <Tooltip title={label}>
      <IconButton
        aria-label={label}
        onClick={onClick}
        size="small"
      >
        <Icon
          aria-hidden
          size={16}
          strokeWidth="1.5px"
        />
      </IconButton>
    </Tooltip>
  );
}
