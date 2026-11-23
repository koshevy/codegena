import type { GeneratedView } from '@codegena/playground-ui/preferences';
import type { PanelHeaderToolbarOption } from '@codegena/ui-unified/panels';
import { GitBranch, ListTree } from 'lucide-react';
import { useMemo } from 'react';

const iconProps = {
  'aria-hidden': true,
  'size': '1.1rem',
  'strokeWidth': 1.5,
} as const;

export function useToolbarButtons(): PanelHeaderToolbarOption<GeneratedView>[] {
  return useMemo(() => [
    {
      icon: (
        <ListTree {...iconProps} />
      ),
      title: 'List',
      value: 'list',
    },
    {
      icon: (
        <GitBranch {...iconProps} />
      ),
      title: 'Graph',
      value: 'graph',
    },
  ], []);
}
