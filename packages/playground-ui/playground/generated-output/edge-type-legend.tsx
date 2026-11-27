import type { GraphPayloadEdgeRelation } from '@codegena/graph-core';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { LineSquiggle } from 'lucide-react';
import type { ReactElement } from 'react';

const edgeTypes = [
  { color: 'primary', label: 'Import', relation: 'import' },
  { color: 'secondary', label: 'Reference', relation: 'reference' },
  { color: 'warning', label: 'Placement', relation: 'placement' },
] as const;

interface EdgeTypeLegendProps {
  relations: readonly GraphPayloadEdgeRelation[];
}

export function EdgeTypeLegend({ relations }: EdgeTypeLegendProps): ReactElement {
  const visibleEdgeTypes = edgeTypes.filter(({ relation }) => (
    relations.includes(relation)
  ));

  return (
    <Stack
      aria-label="Visible edge types"
      direction="row"
      role="list"
      spacing={2}
    >
      {visibleEdgeTypes.map(({ color, label, relation }) => (
        <Chip
          color={color}
          icon={<LineSquiggle size={14} />}
          key={relation}
          label={label}
          role="listitem"
          size="small"
          variant="outlined"
        />
      ))}
    </Stack>
  );
}
