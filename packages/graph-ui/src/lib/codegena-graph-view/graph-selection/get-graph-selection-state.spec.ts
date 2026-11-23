import { getGraphSelectionState, type GraphPayload } from '@codegena/graph-core';

import { comprehensiveGraph } from '../__mocks__';

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
      id: 'items->items/nested',
      label: 'placement',
      source: 'items',
      target: 'items/nested',
    },
    {
      data: { relation: 'placement' },
      id: 'items/nested->items/nested/deep.ts',
      label: 'placement',
      source: 'items/nested',
      target: 'items/nested/deep.ts',
    },
  ],
  logs: [],
  nodes: [
    {
      data: { kind: 'directory', label: './', relativeDirectoryPath: '.' },
      id: '.',
      type: 'directory',
    },
    {
      data: { kind: 'directory', label: 'items', relativeDirectoryPath: './items' },
      id: 'items',
      parentId: '.',
      type: 'directory',
    },
    {
      data: {
        kind: 'directory',
        label: 'nested',
        relativeDirectoryPath: './items/nested',
      },
      id: 'items/nested',
      parentId: 'items',
      type: 'directory',
    },
    {
      data: {
        fileName: 'index.ts',
        kind: 'group',
        label: 'index.ts',
        programmingLanguage: 'TypeScript',
        text: '',
      },
      id: 'index.ts',
      parentId: '.',
      type: 'default',
    },
    {
      data: {
        fileName: 'item.ts',
        kind: 'group',
        label: 'item.ts',
        programmingLanguage: 'TypeScript',
        text: '',
      },
      id: 'items/item.ts',
      parentId: 'items',
      type: 'default',
    },
    {
      data: {
        fileName: 'deep.ts',
        kind: 'group',
        label: 'deep.ts',
        programmingLanguage: 'TypeScript',
        text: '',
      },
      id: 'items/nested/deep.ts',
      parentId: 'items/nested',
      type: 'default',
    },
  ],
};

describe('getGraphSelectionState', () => {
  it('keeps an external file selection implicit for one of several declarations', () => {
    const state = getGraphSelectionState(
      comprehensiveGraph,
      new Set(['first-level.ts::FirstLevel']),
      ['first-level.ts'],
    );

    expect(state.selectedNodeIds.has('first-level.ts')).toBe(true);
    expect(state.implicitlySelectedIds.has('first-level.ts')).toBe(true);
    expect(state.implicitlySelectedIds.has('first-level.ts::FirstLevel')).toBe(false);
  });

  it('implicitly selects a directory’s direct directories and files', () => {
    const state = getGraphSelectionState(graph, new Set(['.']));

    expect([...state.implicitlySelectedIds].toSorted()).toEqual([
      'index.ts',
      'items',
    ]);
  });

  it('includes direct children for each explicitly selected directory', () => {
    const state = getGraphSelectionState(graph, new Set(['.', 'items']));

    expect([...state.implicitlySelectedIds].toSorted()).toEqual([
      'index.ts',
      'items/item.ts',
      'items/nested',
    ]);
  });

  it('does not select children belonging to an implicitly selected directory', () => {
    const state = getGraphSelectionState(
      graph,
      new Set(['.', 'items/nested/deep.ts']),
    );

    expect(state.implicitlySelectedIds.has('items')).toBe(true);
    expect(state.implicitlySelectedIds.has('items/item.ts')).toBe(false);
    expect(state.selectedNodeIds.has('items/nested')).toBe(false);
  });
});
