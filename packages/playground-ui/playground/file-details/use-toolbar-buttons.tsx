import type { GeneratedFileDetailsScope } from '@codegena/playground-ui/preferences';
import type { PanelHeaderToolbarOption } from '@codegena/ui-unified/panels';
import { Files, SquareMousePointer } from 'lucide-react';
import { useMemo } from 'react';

type ToolbarButtons = PanelHeaderToolbarOption<GeneratedFileDetailsScope>[];

const iconProps = {
  'aria-hidden': true,
  'size': '1.1rem',
  'strokeWidth': 1.5,
} as const;

export function useToolbarButtons(): ToolbarButtons {
  return useMemo(() => [
    {
      icon: (
        <SquareMousePointer {...iconProps} />
      ),
      title: 'Show selected',
      value: 'selected',
    },
    {
      icon: (
        <Files {...iconProps} />
      ),
      title: 'Show all',
      value: 'all',
    },
  ], []);
}
