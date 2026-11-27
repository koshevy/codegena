import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import type { ReactElement } from 'react';

export interface PanelToggleProps {
  isOpen: boolean;
  isVisible: boolean;
  onToggle: () => void;
  position: 'left' | 'right';
  title: string;
}

const panelIcons = {
  left: { closed: PanelLeftOpen, open: PanelLeftClose },
  right: { closed: PanelRightOpen, open: PanelRightClose },
};

export function PanelToggle({
  isOpen,
  isVisible,
  onToggle,
  position,
  title,
}: PanelToggleProps): ReactElement | null {
  if (!isVisible) {
    return null;
  }

  const label = `${isOpen ? 'Hide' : 'Show'} ${title}`;

  const Icon = isOpen
    ? panelIcons[position].open
    : panelIcons[position].closed;

  return (
    <Tooltip title={label}>
      <IconButton
        aria-label={label}
        onClick={onToggle}
        size="small"
      >
        <Icon
          aria-hidden
          strokeWidth="1.5px"
          size={19}
        />
      </IconButton>
    </Tooltip>
  );
}
