import type { GraphPayload } from '../graph-payload';
import { getDirectedSelectionPaths } from './get-directed-selection-paths';

const targetFileId = 'items/_common/generator-recipe.ts';

const graph: GraphPayload = {
  edges: [
    {
      data: { relation: 'placement' },
      id: '.->items',
      label: 'placement',
      source: '.',
      target: 'items',
    },
    {
      data: { relation: 'placement' },
      id: 'items->items/_common',
      label: 'placement',
      source: 'items',
      target: 'items/_common',
    },
    {
      data: { relation: 'placement' },
      id: `items/_common->${targetFileId}`,
      label: 'placement',
      source: 'items/_common',
      target: targetFileId,
    },
  ],
  logs: [],
  nodes: [
    {
      data: {
        kind: 'directory',
        label: './',
        relativeDirectoryPath: '.',
      },
      id: '.',
      type: 'directory',
    },
    {
      data: {
        kind: 'directory',
        label: 'items',
        relativeDirectoryPath: './items',
      },
      id: 'items',
      parentId: '.',
      type: 'directory',
    },
    {
      data: {
        kind: 'directory',
        label: '_common',
        relativeDirectoryPath: './items/_common',
      },
      id: 'items/_common',
      parentId: 'items',
      type: 'directory',
    },
    {
      data: {
        fileName: 'generator-recipe.ts',
        kind: 'group',
        label: 'generator-recipe.ts',
        programmingLanguage: 'TypeScript',
        text: '',
      },
      id: targetFileId,
      parentId: 'items/_common',
      type: 'default',
    },
  ],
};

describe('getDirectedSelectionPaths', () => {
  it('includes placement edges and nested directories between selected nodes', () => {
    const selectedIds = new Set(['.', targetFileId]);
    const result = getDirectedSelectionPaths(graph, selectedIds, selectedIds);

    expect([...result.implicitNodeIds].toSorted()).toEqual([
      'items',
      'items/_common',
    ]);

    expect([...result.edgeIds].toSorted()).toEqual([
      '.->items',
      'items->items/_common',
      `items/_common->${targetFileId}`,
    ]);
  });
});
