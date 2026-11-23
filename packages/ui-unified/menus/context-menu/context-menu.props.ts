import type { MenuProps } from '@mui/material/Menu';
import type { MouseEvent, ReactNode } from 'react';

interface ContextMenuItemBase {
  disabled?: boolean;
  icon: ReactNode;
  id: string;
  label: string;
  onSelect: (event: MouseEvent<HTMLElement>) => void;
}

export interface ContextMenuActionItem extends ContextMenuItemBase {
  selected?: never;
  type?: 'action';
}

export interface ContextMenuChoiceItem extends ContextMenuItemBase {
  selected: boolean;
  type: 'choice';
}

export type ContextMenuItem = ContextMenuActionItem | ContextMenuChoiceItem;

export interface ContextMenuPosition {
  left: number;
  top: number;
}

interface ContextMenuBaseProps {
  ariaLabel: string;
  disableEnforceFocus?: boolean;
  disableRestoreFocus?: boolean;
  header?: string;
  items: ContextMenuItem[];
  onClose: () => void;
}

type ContextMenuPlacement = {
  anchor: HTMLElement | null;
  anchorOrigin?: MenuProps['anchorOrigin'];
  position?: never;
  transformOrigin?: MenuProps['transformOrigin'];
} | {
  anchor?: never;
  anchorOrigin?: never;
  position: ContextMenuPosition | null;
  transformOrigin?: never;
};

export type ContextMenuProps = ContextMenuBaseProps & ContextMenuPlacement;
