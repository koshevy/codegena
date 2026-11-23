import type { GeneratedView } from '@codegena/playground-ui/preferences';
import type { ContextMenuItem } from '@codegena/ui-unified/menus';
import {
  GitBranch,
  ListTree,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import { useMemo } from 'react';

interface ContextMenuItemsProps {
  detailsOpen: boolean;
  generatedView: GeneratedView;
  onToggleDetails: () => void;
  onToggleGeneratedView: () => void;
  onToggleSource: () => void;
  sourceOpen: boolean;
}

export function useContextMenuItems({
  detailsOpen,
  generatedView,
  onToggleDetails,
  onToggleGeneratedView,
  onToggleSource,
  sourceOpen,
}: ContextMenuItemsProps): ContextMenuItem[] {
  return useMemo(() => [
    {
      icon: sourceOpen
        ? <PanelLeftClose aria-hidden />
        : <PanelLeftOpen aria-hidden />,
      id: 'toggle-source',
      label: `${sourceOpen ? 'Hide' : 'Show'} source schema`,
      onSelect: onToggleSource,
    },
    {
      icon: detailsOpen
        ? <PanelRightClose aria-hidden />
        : <PanelRightOpen aria-hidden />,
      id: 'toggle-details',
      label: `${detailsOpen ? 'Hide' : 'Show'} file details`,
      onSelect: onToggleDetails,
    },
    {
      icon: generatedView === 'graph'
        ? <ListTree aria-hidden />
        : <GitBranch aria-hidden />,
      id: 'toggle-view',
      label: generatedView === 'graph' ? 'Switch to file list' : 'Switch to graph',
      onSelect: onToggleGeneratedView,
    },
  ], [
    detailsOpen,
    generatedView,
    onToggleDetails,
    onToggleGeneratedView,
    onToggleSource,
    sourceOpen,
  ]);
}
