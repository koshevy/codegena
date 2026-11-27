import type {
  GraphPayloadDirectoryNodeData,
  GraphPayloadEdge,
  GraphPayloadGroupNodeData,
} from '@codegena/graph-core';
import type { Node } from '@xyflow/react';
import ELK from 'elkjs/lib/elk.bundled.js';

const elk = new ELK();

// ELK lays out padded rectangles; React Flow renders the original file sizes.
const horizontalClearance = 40;
const verticalClearance = 44;

const layoutOptions = {
  'org.eclipse.elk.algorithm': 'layered',
  'org.eclipse.elk.direction': 'RIGHT',
  'org.eclipse.elk.layered.nodePlacement.strategy': 'SIMPLE',
  'org.eclipse.elk.layered.spacing.nodeNodeBetweenLayers': '80',
  'org.eclipse.elk.separateConnectedComponents': 'true',
  'org.eclipse.elk.spacing.componentComponent': '72',
  'org.eclipse.elk.spacing.nodeNode': '64',
};

type ContainerData = GraphPayloadDirectoryNodeData | GraphPayloadGroupNodeData;

/** Positions files and directories from import and placement relations. */
export async function layoutGraphContainers(
  containers: Node<ContainerData>[],
  layoutEdges: GraphPayloadEdge[],
): Promise<Node<ContainerData>[]> {
  if (containers.length === 0) {
    return [];
  }

  const hasDirectories = containers.some(({ data }) => (
    data.kind === 'directory'
  ));

  const activeLayoutOptions = hasDirectories
    ? {
        ...layoutOptions,
        'org.eclipse.elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
        'org.eclipse.elk.layered.crossingMinimization.forceNodeModelOrder': 'true',
        'org.eclipse.elk.layered.layering.strategy': 'LONGEST_PATH_SOURCE',
      }
    : layoutOptions;

  const layout = await elk.layout({
    id: 'containers',
    layoutOptions: activeLayoutOptions,
    children: containers.map(({ id, style }) => ({
      id,
      width: Number(style?.width) + horizontalClearance,
      height: Number(style?.height) + verticalClearance,
    })),
    edges: layoutEdges.map(({ id, source, target }) => ({
      id,
      sources: [source],
      targets: [target],
    })),
  });

  const positions = new Map(layout.children?.map(({ id, x, y }) => [id, { x, y }]));

  return containers.map((container) => {
    const position = positions.get(container.id);

    if (position?.x === undefined || position.y === undefined) {
      throw new Error(`ELK did not position ${container.id}.`);
    }

    return { ...container, position: { x: position.x, y: position.y } };
  });
}
