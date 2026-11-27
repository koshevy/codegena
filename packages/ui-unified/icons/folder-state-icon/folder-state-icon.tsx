import type {} from '@codegena/ui-theme';
import { useTheme } from '@mui/material/styles';
import { FolderClosed, FolderOpen } from 'lucide-react';
import type { ReactElement } from 'react';

export interface FolderStateIconProps {
  className?: string;
  isExpanded: boolean;
  size?: number | string;
}

export function FolderStateIcon({
  className,
  isExpanded,
  size = '1.1rem',
}: FolderStateIconProps): ReactElement {
  const theme = useTheme();
  const Icon = isExpanded ? FolderOpen : FolderClosed;

  return (
    <Icon
      aria-hidden
      className={className}
      color={theme.palette.warning.onLight}
      fill={isExpanded ? theme.palette.warning.lightSurface : 'transparent'}
      size={size}
      strokeWidth={1.2}
    />
  );
}
