import type {
  GraphPayloadEdge,
  GraphPayloadEdgeRelation,
} from '@codegena/graph-core';
import { MarkerType, type Edge } from '@xyflow/react';
import type { CSSProperties } from 'react';

/**
 * Selection and appearance inputs for rendering graph relations.
 */
export interface CreateFlowEdgesProps {
  edges: GraphPayloadEdge[];
  selectedNodeIds: ReadonlySet<string>;
  explicitlySelectedIds?: ReadonlySet<string>;
  directedPathEdgeIds?: ReadonlySet<string>;
  appearance: {
    relationColors: Record<GraphPayloadEdgeRelation, string>;
    mutedColor: string;
    labelBackgroundColor: string;
    labelFontFamily?: CSSProperties['fontFamily'];
  };
}

/**
 * Creates styled React Flow edges from graph relations and selection state.
 *
 * @param props - Relations, selection state, and edge appearance.
 * @returns Edges styled for their relation and current selection.
 */
export function createFlowEdges({
  appearance,
  directedPathEdgeIds,
  edges,
  selectedNodeIds,
  explicitlySelectedIds = selectedNodeIds,
}: CreateFlowEdgesProps): Edge[] {
  return edges.map((edge) => {
    const selectedEndpoints = Number(selectedNodeIds.has(edge.source))
      + Number(selectedNodeIds.has(edge.target));

    const isConnectedToSelection = selectedEndpoints > 0;
    const isBetweenSelectedNodes = selectedEndpoints === 2;
    const isOnSelectedPath = directedPathEdgeIds?.has(edge.id)
      ?? isBetweenSelectedNodes;

    const isActive = explicitlySelectedIds.size === 1
      ? isConnectedToSelection
      : explicitlySelectedIds.size > 1 && isOnSelectedPath;

    const relationColor = appearance.relationColors[edge.data.relation];

    const color = !isActive && selectedNodeIds.size > 0
      ? appearance.mutedColor
      : relationColor;

    return {
      ...edge,
      animated: isActive,
      ariaLabel: `${edge.data.relation} edge from ${edge.source} to ${edge.target}`,
      label: '',
      labelBgBorderRadius: 4,
      labelBgPadding: [4, 2],
      labelBgStyle: { fill: appearance.labelBackgroundColor },
      labelStyle: {
        fill: color,
        fontFamily: appearance.labelFontFamily,
        fontSize: 10,
        fontWeight: 700,
      },
      markerEnd: { color, type: MarkerType.ArrowClosed },
      selectable: false,
      style: {
        stroke: color,
        strokeDasharray: isActive ? 8 : undefined,
        strokeWidth: 1.5,
      },
      type: 'default',
      zIndex: isActive ? 1 : 0,
    };
  });
}
