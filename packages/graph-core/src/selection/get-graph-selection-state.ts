import type { GraphPayload } from '../graph-payload';
import {
  getDirectedSelectionPaths,
  type DirectedSelectionPaths,
} from './get-directed-selection-paths';
import { getSelectedNodeIds } from './graph-selection';

export interface GraphSelectionState {
  activeNodeIds: Set<string>;
  directedSelectionPaths: DirectedSelectionPaths;
  implicitlySelectedIds: Set<string>;
  selectedNodeIds: Set<string>;
}

/**
 * Derives effective selection and directed paths from explicit node IDs.
 * Direct directories and files inherit selection from explicitly selected directories.
 *
 * @param graph - Graph containing the selectable nodes and relations.
 * @param explicitlySelectedIds - Nodes selected directly by the user or caller.
 * @param implicitSelectedNodeIds - Additional implicit nodes supplied by the caller.
 * @returns Effective, implicit, and path selections for the graph.
 */
export function getGraphSelectionState(
  graph: GraphPayload,
  explicitlySelectedIds: ReadonlySet<string>,
  implicitSelectedNodeIds: readonly string[] = [],
): GraphSelectionState {
  const directChildIds = graph.nodes
    .filter((node) => (
      (node.data.kind === 'group' || node.data.kind === 'directory')
      && node.parentId !== undefined
      && explicitlySelectedIds.has(node.parentId)
    ))
    .map(({ id }) => id);

  const selectedNodeIds = getSelectedNodeIds(graph, new Set([
    ...explicitlySelectedIds,
    ...directChildIds,
    ...implicitSelectedNodeIds,
  ]));

  const directedSelectionPaths = getDirectedSelectionPaths(
    graph,
    selectedNodeIds,
    explicitlySelectedIds,
  );

  const activeNodeIds = getSelectedNodeIds(graph, new Set([
    ...selectedNodeIds,
    ...directedSelectionPaths.implicitNodeIds,
  ]));

  const implicitlySelectedIds = new Set(
    [...activeNodeIds].filter((id) => !explicitlySelectedIds.has(id)),
  );

  return {
    activeNodeIds,
    directedSelectionPaths,
    implicitlySelectedIds,
    selectedNodeIds,
  };
}
