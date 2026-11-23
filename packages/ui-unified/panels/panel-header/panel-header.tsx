import Box from '@mui/material/Box';
import type { ReactElement } from 'react';

import { PanelHeaderContent } from './panel-header-content';
import type { PanelHeaderProps } from './panel-header.props';
import {
  panelHeaderClasses,
  PanelHeaderStyles,
} from './panel-header.styles';
import { usePanelHeaderContextMenu } from './use-panel-header-context-menu';
import { ContextMenu } from '../../menus/context-menu';

export function PanelHeader({
  actions,
  afterTitle,
  contextMenuItems,
  hideHeading = false,
  icon,
  leading,
  title,
}: PanelHeaderProps): ReactElement {
  const {
    handleClose,
    handleContextMenu,
    menuPosition,
  } = usePanelHeaderContextMenu(contextMenuItems);

  const hasToShowLeading = !!leading;
  const hasToShowActions = !!actions;
  const hasToShowContextMenu = contextMenuItems !== undefined;

  const renderedLeading = hasToShowLeading && (
    <Box className={panelHeaderClasses.leading}>
      {leading}
    </Box>
  );

  const renderedActions = hasToShowActions && (
    <Box className={panelHeaderClasses.actions}>
      {actions}
    </Box>
  );

  const renderedContextMenu = hasToShowContextMenu && (
    <ContextMenu
      ariaLabel={`${title} actions`}
      items={contextMenuItems}
      onClose={handleClose}
      position={menuPosition}
    />
  );

  return (
    <PanelHeaderStyles
      aria-label={`${title} header`}
      onContextMenu={handleContextMenu}
      role="group"
    >
      {renderedLeading}
      <PanelHeaderContent
        afterTitle={afterTitle}
        hideHeading={hideHeading}
        icon={icon}
        title={title}
      />
      {renderedActions}
      {renderedContextMenu}
    </PanelHeaderStyles>
  );
}
