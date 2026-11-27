import type {
  GraphPayload,
  GraphPayloadDirectoryNode,
  GraphPayloadDirectoryNodeData,
  GraphPayloadGroupNode,
  GraphPayloadGroupNodeData,
  GraphPayloadItemNode,
  GraphPayloadItemNodeData,
} from '@codegena/graph-core';
import type { Node } from '@xyflow/react';

import { getDirectoryNodeDescription } from '../get-directory-node-description';
import { getDirectoryNodeWidth } from '../get-directory-node-width';
import { createItemNodes, datatypeNodeHeight } from './create-item-nodes';
import { getVisibleGraphNodes } from './get-visible-graph-nodes';
import { layoutGraphContainers } from './layout-graph-containers';

const fileWidth = 360;
const emptyFileHeight = 80;
const fileBottomPadding = 16;
const directoryHeight = 64;

/**
 * Positions directories, generated files, and declarations for React Flow.
 *
 * @param graph - Framework-neutral graph payload.
 * @returns Positioned containers followed by declaration nodes.
 */
export async function createFlowNodes(
  graph: GraphPayload,
  expandedDirectoryIds: ReadonlySet<string> = new Set(['.']),
): Promise<Node[]> {
  const visibleNodes = getVisibleGraphNodes(graph.nodes, expandedDirectoryIds);
  const itemNodes = visibleNodes.filter(
    (node): node is GraphPayloadItemNode => node.data.kind === 'item',
  );

  const itemsByGroup = Map.groupBy(itemNodes, (node) => node.parentId);

  const groupedNodes = visibleNodes
    .filter((node): node is GraphPayloadGroupNode => node.data.kind === 'group')
    .map((group): {
      file: Node<GraphPayloadGroupNodeData>;
      items: Node<GraphPayloadItemNodeData>[];
    } => {
      const items = createItemNodes(itemsByGroup.get(group.id) ?? []);
      const lastItem = items.at(-1);

      const height = lastItem
        ? lastItem.position.y + datatypeNodeHeight + fileBottomPadding
        : emptyFileHeight;

      return {
        file: {
          data: group.data,
          id: group.id,
          ariaLabel: `${group.data.fileName} generated file`,
          draggable: false,
          initialHeight: height,
          initialWidth: fileWidth,
          position: { x: 0, y: 0 },
          style: { height, width: fileWidth },
          type: 'file',
        },
        items,
      };
    });

  const files = groupedNodes.map(({ file }) => file);
  const childrenByDirectory = Map.groupBy(
    graph.nodes.filter((node): node is (
      GraphPayloadDirectoryNode | GraphPayloadGroupNode
    ) => node.data.kind === 'directory' || node.data.kind === 'group'),
    ({ parentId }) => parentId,
  );

  const directories = visibleNodes
    .filter((node): node is GraphPayloadDirectoryNode => (
      node.data.kind === 'directory'
    ))
    .toSorted((first, second) => first.id.localeCompare(second.id))
    .map((directory): Node<GraphPayloadDirectoryNodeData> => {
      const children = childrenByDirectory.get(directory.id) ?? [];
      const directoryCount = children.filter(({ data }) => (
        data.kind === 'directory'
      )).length;

      const description = getDirectoryNodeDescription(
        directoryCount,
        children.length - directoryCount,
      );

      const width = getDirectoryNodeWidth(directory.data.label, description);

      return {
        ariaLabel: `${directory.data.relativeDirectoryPath} directory`,
        data: { ...directory.data, description },
        draggable: false,
        focusable: true,
        id: directory.id,
        initialHeight: directoryHeight,
        initialWidth: width,
        position: { x: 0, y: 0 },
        style: {
          height: directoryHeight,
          width,
        },
        type: 'directory',
      };
    });

  const containers = directories.length > 0
    ? [
        ...directories,
        ...files.toSorted((first, second) => first.id.localeCompare(second.id)),
      ]
    : files;
  const containerIds = new Set(containers.map(({ id }) => id));

  const layoutEdges = graph.edges.filter(({ data, source, target }) => (
    (data.relation === 'import' || data.relation === 'placement')
    && containerIds.has(source)
    && containerIds.has(target)
  ));

  const positionedContainers = await layoutGraphContainers(containers, layoutEdges);

  return [
    ...positionedContainers,
    ...groupedNodes.flatMap(({ items }) => items),
  ];
}
