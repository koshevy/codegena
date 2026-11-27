import Box from '@mui/material/Box';
import { type MouseEvent, type ReactElement, useCallback } from 'react';

import {
  contextMenuEntryClasses,
  ContextMenuEntryStyles,
} from './context-menu-entry.styles';
import type { ContextMenuItem } from './context-menu.props';

interface ContextMenuEntryProps {
  item: ContextMenuItem;
  onClose: () => void;
}

export function ContextMenuEntry({
  item,
  onClose,
}: ContextMenuEntryProps): ReactElement {
  const isChoice = item.type === 'choice';
  const isSelectedChoice = isChoice && item.selected;
  const ariaChecked = isChoice ? item.selected : undefined;
  const role = isChoice ? 'menuitemradio' : undefined;

  const handleSelect = useCallback((event: MouseEvent<HTMLElement>): void => {
    onClose();
    item.onSelect(event);
  }, [
    item,
    onClose,
  ]);

  return (
    <ContextMenuEntryStyles
      aria-checked={ariaChecked}
      disabled={item.disabled}
      onClick={handleSelect}
      role={role}
      selected={isSelectedChoice}
    >
      <Box
        className={contextMenuEntryClasses.icon}
        component="span"
      >
        {item.icon}
      </Box>
      {item.label}
    </ContextMenuEntryStyles>
  );
}
