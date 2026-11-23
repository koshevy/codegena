import type { GraphPayload } from '../graph-payload';
import type { GraphPayloadItemNode, GraphPayloadNode } from '../graph-payload-node';

function isGroupChild(node: GraphPayloadNode, groupId: string): boolean {
  return node.data.kind === 'item' && node.parentId === groupId;
}

/**
 * Adds implicitly selected file or declaration nodes to an explicit selection.
 *
 * @param graph - Graph containing the file and declaration relationships.
 * @param explicitlySelectedIds - Node IDs selected directly by the user.
 * @returns IDs selected either directly or through their containing file.
 */
export function getSelectedNodeIds(
  graph: GraphPayload,
  explicitlySelectedIds: ReadonlySet<string>,
): Set<string> {
  const selectedIds = new Set(
    graph.nodes
      .filter(({ id }) => explicitlySelectedIds.has(id))
      .map(({ id }) => id),
  );

  const childrenByGroup = Map.groupBy(
    graph.nodes.filter((node): node is GraphPayloadItemNode => (
      node.data.kind === 'item'
    )),
    ({ parentId }) => parentId,
  );

  graph.nodes.forEach((group) => {
    if (group.data.kind !== 'group') {
      return;
    }

    const children = childrenByGroup.get(group.id) ?? [];
    const [onlyChild] = children;

    if (onlyChild && children.length === 1 && selectedIds.has(group.id)) {
      selectedIds.add(onlyChild.id);
    }

    if (children.length > 0 && children.every(({ id }) => selectedIds.has(id))) {
      selectedIds.add(group.id);
    }
  });

  return selectedIds;
}

function getSingleItemPair(
  graph: GraphPayload,
  nodeId: string,
): { groupId: string; itemId: string } | null {
  const node = graph.nodes.find(({ id }) => id === nodeId);

  if (!node) {
    return null;
  }

  if (node.data.kind === 'directory') {
    return null;
  }

  const groupId = node.data.kind === 'item' ? node.parentId : node.id;

  if (!groupId) {
    return null;
  }

  const children = graph.nodes.filter((child) => isGroupChild(child, groupId));
  const [onlyChild] = children;

  if (!onlyChild || children.length !== 1) {
    return null;
  }

  return { groupId, itemId: onlyChild.id };
}

function toggleExplicitNodeId(
  explicitlySelectedIds: ReadonlySet<string>,
  nodeId: string,
): Set<string> {
  const nextIds = new Set(explicitlySelectedIds);

  if (nextIds.has(nodeId)) {
    nextIds.delete(nodeId);
    return nextIds;
  }

  nextIds.add(nodeId);
  return nextIds;
}

/**
 * Toggles one explicit selection while preserving single-item file behavior.
 *
 * @param graph - Graph containing the selected node.
 * @param explicitlySelectedIds - Current explicit selection.
 * @param nodeId - Node being toggled.
 * @param isAdditive - Whether the interaction adds to the current selection.
 * @returns The next explicit selection.
 */
export function toggleSelectedNode(
  graph: GraphPayload,
  explicitlySelectedIds: ReadonlySet<string>,
  nodeId: string,
  isAdditive: boolean,
): Set<string> {
  const node = graph.nodes.find(({ id }) => id === nodeId);

  if (!node) {
    return new Set(explicitlySelectedIds);
  }

  if (!isAdditive
    && explicitlySelectedIds.size < 2
    && explicitlySelectedIds.has(nodeId)) {
    return new Set();
  }

  if (!isAdditive) {
    return new Set([nodeId]);
  }

  const singleItemPair = getSingleItemPair(graph, nodeId);
  const relatedNodeId = singleItemPair?.groupId === nodeId
    ? singleItemPair.itemId
    : singleItemPair?.groupId;

  if (relatedNodeId && explicitlySelectedIds.has(relatedNodeId)) {
    return toggleExplicitNodeId(explicitlySelectedIds, nodeId);
  }

  const selectedIds = getSelectedNodeIds(graph, explicitlySelectedIds);
  const nextIds = new Set(explicitlySelectedIds);

  if (!selectedIds.has(nodeId)) {
    nextIds.add(nodeId);
    return nextIds;
  }

  nextIds.delete(nodeId);

  if (singleItemPair) {
    nextIds.delete(singleItemPair.groupId);
    nextIds.delete(singleItemPair.itemId);

    return nextIds;
  }

  if (node.data.kind !== 'group' || !getSelectedNodeIds(graph, nextIds).has(nodeId)) {
    return nextIds;
  }

  graph.nodes.forEach((child) => {
    if (child.data.kind === 'item'
      && 'parentId' in child
      && child.parentId === nodeId) {
      nextIds.delete(child.id);
    }
  });

  return nextIds;
}

/**
 * Removes a node and any explicitly selected declarations it contains.
 *
 * @param graph - Graph containing the selected node.
 * @param explicitlySelectedIds - Current explicit selection.
 * @param nodeId - Node being deselected.
 * @returns The remaining explicit selection.
 */
export function deselectSelectedNode(
  graph: GraphPayload,
  explicitlySelectedIds: ReadonlySet<string>,
  nodeId: string,
): Set<string> {
  const nextIds = new Set(explicitlySelectedIds);
  const singleItemPair = getSingleItemPair(graph, nodeId);

  if (singleItemPair) {
    nextIds.delete(singleItemPair.groupId);
    nextIds.delete(singleItemPair.itemId);
    return nextIds;
  }

  nextIds.delete(nodeId);

  const node = graph.nodes.find(({ id }) => id === nodeId);

  if (node?.data.kind === 'group') {
    graph.nodes.forEach((child) => {
      if (child.data.kind === 'item' && child.parentId === nodeId) {
        nextIds.delete(child.id);
      }
    });
  }

  return nextIds;
}
