import type { GraphPayload, GraphPayloadEdge } from '@codegena/graph-core';

import { comprehensiveGraph, geometryGraph } from '../__mocks__';
import { createFlowNodes } from './create-flow-nodes';

describe('createFlowNodes', () => {
  it('hides directory descendants until the directory is expanded', async () => {
    const files = geometryGraph.nodes.filter(({ data }) => data.kind === 'group');
    const rootDirectory = {
      data: { kind: 'directory', label: './', relativeDirectoryPath: '.' },
      id: '.',
      type: 'directory',
    } as const;

    const nestedDirectory = {
      data: { kind: 'directory', label: 'actions', relativeDirectoryPath: './actions' },
      id: 'actions',
      parentId: '.',
      type: 'directory',
    } as const;

    const placementEdges: GraphPayloadEdge[] = [
      {
        data: { relation: 'placement' },
        id: '.->actions',
        label: 'placement',
        source: '.',
        target: 'actions',
      },
      ...files.map(({ id }): GraphPayloadEdge => ({
        data: { relation: 'placement' },
        id: `actions->${id}`,
        label: 'placement',
        source: 'actions',
        target: id,
      })),
    ];

    const graph: GraphPayload = {
      ...geometryGraph,
      edges: [...placementEdges, ...geometryGraph.edges],
      nodes: [
        rootDirectory,
        nestedDirectory,
        ...geometryGraph.nodes.map((node) => (
          node.data.kind === 'group' ? { ...node, parentId: 'actions' } : node
        )),
      ],
    };

    const collapsed = await createFlowNodes(graph);
    const expanded = await createFlowNodes(graph, new Set(['.', 'actions']));

    expect(collapsed.map(({ id }) => id)).toEqual(['.', 'actions']);

    const rootNode = collapsed.find(({ id }) => id === '.');
    const actionsNode = collapsed.find(({ id }) => id === 'actions');
    const rootWidth = Number(rootNode?.style?.width);
    const actionsWidth = Number(actionsNode?.style?.width);

    expect(rootWidth).toBeLessThan(actionsWidth);
    expect(actionsWidth).toBeLessThan(280);

    expect(expanded.some(({ id }) => id === 'geometry.ts')).toBe(true);

    const hasGeometryDeclaration = expanded.some(({ id }) => (
      id === 'geometry.ts::Geometry'
    ));

    expect(hasGeometryDeclaration).toBe(true);
  });

  it('orders imported files after the files that use them', async () => {
    const nodes = await createFlowNodes(geometryGraph);
    const geometry = nodes.find(({ id }) => id === 'geometry.ts');
    const position = nodes.find(({ id }) => id === 'position.ts');

    if (!geometry || !position) {
      throw new Error('The geometry graph must contain both file nodes.');
    }

    expect(geometry.position.x).toBeLessThan(position.position.x);
  });

  it('assigns positions to payload nodes without changing the payload', async () => {
    const originalNodes = structuredClone(geometryGraph.nodes);
    const nodes = await createFlowNodes(geometryGraph);

    expect(geometryGraph.nodes).toEqual(originalNodes);
    expect(geometryGraph.nodes.every((node) => !('position' in node))).toBe(true);
    expect(nodes.every(({ position }) => (
      Number.isFinite(position.x) && Number.isFinite(position.y)
    ))).toBe(true);
  });

  it('keeps grouped datatypes inside their file without overlap', async () => {
    const flowNodes = await createFlowNodes(comprehensiveGraph);
    const fileNode = flowNodes.find((node) => (
      node.type === 'file' && node.id === 'first-level.ts'
    ));

    if (!fileNode) {
      throw new Error('The comprehensive graph must contain first-level.ts.');
    }

    const children = flowNodes.filter((node) => (
      node.parentId === fileNode.id
    ));

    expect(children.length).toBeGreaterThan(1);

    const uniqueVerticalPositions = new Set(children.map(({ position }) => position.y));

    expect(uniqueVerticalPositions.size).toBe(children.length);
    expect(children.every(({ position }) => (
      position.x >= 0
      && position.x + 320 <= Number(fileNode.style?.width)
      && position.y >= 0
      && position.y + 64 <= Number(fileNode.style?.height)
    ))).toBe(true);
  });

  it('keeps file groups separate in the comprehensive graph', async () => {
    const nodes = await createFlowNodes(comprehensiveGraph);
    const groups = nodes.filter((node) => (
      node.type === 'file'
    ));

    const crowdedGroups = groups.flatMap((group, index) => (
      groups.slice(index + 1).filter((other) => {
        const groupWidth = Number(group.style?.width);
        const groupHeight = Number(group.style?.height);
        const otherWidth = Number(other.style?.width);
        const otherHeight = Number(other.style?.height);
        const horizontalGap = Math.max(
          group.position.x - other.position.x - otherWidth,
          other.position.x - group.position.x - groupWidth,
        );

        const verticalGap = Math.max(
          group.position.y - other.position.y - otherHeight,
          other.position.y - group.position.y - groupHeight,
        );

        return horizontalGap < 80 && verticalGap < 64;
      }).map((other) => [group.id, other.id])
    ));

    expect(crowdedGroups).toEqual([]);
  });

  it('places the comprehensive root near the center of its file groups', async () => {
    const nodes = await createFlowNodes(comprehensiveGraph);
    const groups = nodes.filter((node) => (
      node.type === 'file'
    ));

    const root = groups.find(({ id }) => id === 'comprehensive-schema.ts');

    if (!root) {
      throw new Error('The comprehensive graph must contain its root file.');
    }

    const top = Math.min(...groups.map(({ position }) => position.y));
    const bottom = Math.max(...groups.map(({ position, style }) => (
      position.y + Number(style?.height)
    )));

    const rootCenter = root.position.y + Number(root.style?.height) / 2;
    const graphCenter = (top + bottom) / 2;

    expect(Math.abs(rootCenter - graphCenter)).toBeLessThan((bottom - top) * 0.15);
  });
});
