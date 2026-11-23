import Typography from '@mui/material/Typography';
import type { MouseEvent, ReactElement } from 'react';

import { ContextMenuEntry } from './context-menu-entry';
import type { ContextMenuProps } from './context-menu.props';
import { contextMenuClasses, ContextMenuStyles } from './context-menu.styles';

function stopContextMenu(event: MouseEvent<HTMLElement>): void {
  event.preventDefault();
  event.stopPropagation();
}

export function ContextMenu({
  anchor,
  anchorOrigin,
  ariaLabel,
  disableEnforceFocus,
  disableRestoreFocus,
  header,
  items,
  onClose,
  position,
  transformOrigin,
}: ContextMenuProps): ReactElement {
  const anchorReference = position === undefined ? 'anchorEl' : 'anchorPosition';
  const isOpen = !!anchor || !!position;
  const renderedHeader = header && (
    <Typography
      className={contextMenuClasses.header}
      variant="caption"
    >
      {header}
    </Typography>
  );

  return (
    <ContextMenuStyles
      anchorEl={anchor ?? undefined}
      anchorOrigin={anchorOrigin}
      anchorPosition={position ?? undefined}
      anchorReference={anchorReference}
      disableEnforceFocus={disableEnforceFocus}
      disableRestoreFocus={disableRestoreFocus}
      MenuListProps={{ 'aria-label': ariaLabel }}
      onClose={onClose}
      onContextMenu={stopContextMenu}
      open={isOpen}
      transformOrigin={transformOrigin}
    >
      {renderedHeader}
      {items.map((item) => (
        <ContextMenuEntry
          item={item}
          key={item.id}
          onClose={onClose}
        />
      ))}
    </ContextMenuStyles>
  );
}
