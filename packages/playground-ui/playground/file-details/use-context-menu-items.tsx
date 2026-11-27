import type { ContextMenuItem } from '@codegena/ui-unified/menus';
import { PanelRightClose } from 'lucide-react';
import { useMemo } from 'react';

export function useContextMenuItems(onHide: () => void): ContextMenuItem[] {
  return useMemo(() => [{
    icon: <PanelRightClose aria-hidden />,
    id: 'hide-details',
    label: 'Hide details column',
    onSelect: onHide,
  }], [onHide]);
}
