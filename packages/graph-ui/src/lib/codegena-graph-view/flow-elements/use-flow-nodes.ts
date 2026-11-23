import type { GraphPayload } from '@codegena/graph-core';
import type { Node } from '@xyflow/react';
import { useEffect, useMemo, useState } from 'react';

import { createFlowNodes } from './create-flow-nodes';
import { getVisibleGraphNodes } from './get-visible-graph-nodes';

export function useFlowNodes(
  graph: GraphPayload,
  expandedDirectoryIds: ReadonlySet<string>,
  explicitlySelectedIds: ReadonlySet<string>,
  implicitlySelectedIds: ReadonlySet<string>,
  onToggleDirectory: (id: string) => void,
): {
  isCurrentLayoutReady: boolean;
  isLayoutReady: boolean;
  nodes: Node[];
} {
  const [layout, setLayout] = useState<{
    error?: unknown;
    expandedDirectoryIds: ReadonlySet<string>;
    graph: GraphPayload;
    nodes: Node[];
  }>();

  useEffect(() => {
    let isCurrent = true;

    void createFlowNodes(graph, expandedDirectoryIds)
      .then((positionedNodes) => {
        if (isCurrent) {
          setLayout({ expandedDirectoryIds, graph, nodes: positionedNodes });
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setLayout({ error, expandedDirectoryIds, graph, nodes: [] });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [
    expandedDirectoryIds,
    graph,
  ]);

  if (layout?.graph === graph && layout.error !== undefined) {
    throw layout.error;
  }

  const layoutNodes = layout?.graph === graph ? layout.nodes : null;

  const visibleNodeIds = useMemo(() => new Set(
    getVisibleGraphNodes(graph.nodes, expandedDirectoryIds).map(({ id }) => id),
  ), [
    expandedDirectoryIds,
    graph.nodes,
  ]);

  const nodes = useMemo(() => (layoutNodes ?? [])
    .filter(({ id }) => visibleNodeIds.has(id))
    .map((node) => ({
      ...node,
      className: implicitlySelectedIds.has(node.id)
        ? 'implicitly-selected'
        : node.className,
      data: {
        ...node.data,
        ...(node.type === 'directory' && {
          isExpanded: expandedDirectoryIds.has(node.id),
          onToggle: onToggleDirectory,
        }),
      },
      selected: explicitlySelectedIds.has(node.id),
    })), [
    explicitlySelectedIds,
    expandedDirectoryIds,
    implicitlySelectedIds,
    layoutNodes,
    onToggleDirectory,
    visibleNodeIds,
  ]);

  const isCurrentLayoutReady = layout?.graph === graph
    && layout.expandedDirectoryIds === expandedDirectoryIds;

  return {
    isCurrentLayoutReady,
    isLayoutReady: layoutNodes !== null,
    nodes,
  };
}
