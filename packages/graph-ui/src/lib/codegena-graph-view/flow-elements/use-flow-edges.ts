import type { GraphPayloadEdge } from '@codegena/graph-core';
import type { Theme } from '@mui/material/styles';
import type { Edge } from '@xyflow/react';
import { useMemo } from 'react';

import { createFlowEdges } from './create-flow-edges';

interface UseFlowEdgesProps {
  edges: GraphPayloadEdge[];
  selectedNodeIds: ReadonlySet<string>;
  explicitlySelectedIds: ReadonlySet<string>;
  directedPathEdgeIds: ReadonlySet<string>;
  theme: Theme;
}

export function useFlowEdges({
  directedPathEdgeIds,
  edges,
  explicitlySelectedIds,
  selectedNodeIds,
  theme,
}: UseFlowEdgesProps): Edge[] {
  return useMemo(() => createFlowEdges({
    appearance: {
      labelBackgroundColor: theme.palette.background.paper,
      labelFontFamily: theme.typography.fontFamily,
      mutedColor: theme.palette.divider,
      relationColors: {
        import: theme.palette.primary.main,
        placement: theme.palette.warning.main,
        reference: theme.palette.secondary.main,
      },
    },
    directedPathEdgeIds,
    edges,
    explicitlySelectedIds,
    selectedNodeIds,
  }), [
    directedPathEdgeIds,
    edges,
    explicitlySelectedIds,
    selectedNodeIds,
    theme.palette.background.paper,
    theme.palette.divider,
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.warning.main,
    theme.typography.fontFamily,
  ]);
}
