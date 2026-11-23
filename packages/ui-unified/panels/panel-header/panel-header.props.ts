import type { ReactNode } from 'react';

import type { ContextMenuItem } from '../../menus/context-menu';

export interface PanelHeaderProps {
  actions?: ReactNode;
  afterTitle?: ReactNode;
  contextMenuItems?: ContextMenuItem[];
  hideHeading?: boolean;
  icon?: ReactNode;
  leading?: ReactNode;
  title: string;
}
