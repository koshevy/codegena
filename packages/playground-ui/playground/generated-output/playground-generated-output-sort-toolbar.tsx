import type { GeneratedFileSortMode } from '@codegena/playground-ui/preferences';
import {
  PanelHeaderToolbar,
  type PanelHeaderToolbarOption,
} from '@codegena/ui-unified/panels';
import Typography from '@mui/material/Typography';
import { ArrowDownAZ, ChartNoAxesGantt } from 'lucide-react';
import type { ReactElement } from 'react';

import {
  PlaygroundGeneratedOutputSortToolbarStyles,
} from './playground-generated-output-sort-toolbar.styles';

interface PlaygroundGeneratedOutputSortToolbarProps {
  onChange: (sortMode: GeneratedFileSortMode) => void;
  value: GeneratedFileSortMode;
}

const iconProps = {
  'aria-hidden': true,
  'size': '1.1rem',
  'strokeWidth': 1.5,
} as const;

const sortOptions: PanelHeaderToolbarOption<GeneratedFileSortMode>[] = [
  {
    icon: (
      <ArrowDownAZ {...iconProps} />
    ),
    title: 'By filename',
    value: 'filename',
  },
  {
    icon: (
      <ChartNoAxesGantt {...iconProps} />
    ),
    title: 'By source file and line',
    value: 'source',
  },
];

export function PlaygroundGeneratedOutputSortToolbar({
  onChange,
  value,
}: PlaygroundGeneratedOutputSortToolbarProps): ReactElement {
  return (
    <PlaygroundGeneratedOutputSortToolbarStyles>
      <Typography variant="caption">Sort by</Typography>
      <PanelHeaderToolbar
        ariaLabel="Sort by"
        onChange={onChange}
        options={sortOptions}
        value={value}
      />
    </PlaygroundGeneratedOutputSortToolbarStyles>
  );
}
