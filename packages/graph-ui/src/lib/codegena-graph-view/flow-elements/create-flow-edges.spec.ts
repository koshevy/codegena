import type { GraphPayloadEdge } from '@codegena/graph-core';

import {
  createFlowEdges,
  type CreateFlowEdgesProps,
} from './create-flow-edges';

const appearance: CreateFlowEdgesProps['appearance'] = {
  labelBackgroundColor: '#fff',
  labelFontFamily: 'Arial',
  mutedColor: '#ddd',
  relationColors: {
    import: '#111',
    placement: '#fb0',
    reference: '#222',
  },
};

const edges: GraphPayloadEdge[] = [
  {
    data: { relation: 'placement' },
    id: 'root->a',
    label: 'placement',
    source: 'root',
    target: 'a',
  },
  {
    data: { relation: 'import' },
    id: 'a->b',
    label: 'import',
    source: 'a',
    target: 'b',
  },
  {
    data: { relation: 'reference' },
    id: 'a->c',
    label: 'reference',
    source: 'a',
    target: 'c',
  },
  {
    data: { relation: 'reference' },
    id: 'b->c',
    label: 'reference',
    source: 'b',
    target: 'c',
  },
];

describe('createFlowEdges', () => {
  it('uses solid, non-animated relation colors without a selection', () => {
    const result = createFlowEdges({
      appearance,
      edges,
      selectedNodeIds: new Set<string>(),
    });

    expect(result.map(({ ariaLabel }) => ariaLabel)).toEqual([
      'placement edge from root to a',
      'import edge from a to b',
      'reference edge from a to c',
      'reference edge from b to c',
    ]);

    expect(result.map(({ animated, style }) => ({ animated, style }))).toEqual([
      {
        animated: false,
        style: { stroke: '#fb0', strokeDasharray: undefined, strokeWidth: 1.5 },
      },
      {
        animated: false,
        style: { stroke: '#111', strokeDasharray: undefined, strokeWidth: 1.5 },
      },
      {
        animated: false,
        style: { stroke: '#222', strokeDasharray: undefined, strokeWidth: 1.5 },
      },
      {
        animated: false,
        style: { stroke: '#222', strokeDasharray: undefined, strokeWidth: 1.5 },
      },
    ]);
  });

  it('activates every edge touching a single selected node', () => {
    const result = createFlowEdges({
      appearance,
      edges,
      selectedNodeIds: new Set(['a']),
    });

    expect(result.map(({ animated, style }) => ({
      animated,
      stroke: style?.stroke,
      strokeDasharray: style?.strokeDasharray,
    }))).toEqual([
      { animated: true, stroke: '#fb0', strokeDasharray: 8 },
      { animated: true, stroke: '#111', strokeDasharray: 8 },
      { animated: true, stroke: '#222', strokeDasharray: 8 },
      { animated: false, stroke: '#ddd', strokeDasharray: undefined },
    ]);
  });

  it('ranks active edges above inactive edges for every relation', () => {
    const placementAndImport = createFlowEdges({
      appearance,
      edges,
      selectedNodeIds: new Set(['a']),
    });

    const reference = createFlowEdges({
      appearance,
      edges,
      selectedNodeIds: new Set(['c']),
    });

    expect(placementAndImport.map(({ zIndex }) => zIndex))
      .toEqual([1, 1, 1, 0]);

    expect(reference.map(({ zIndex }) => zIndex))
      .toEqual([0, 0, 1, 1]);
  });

  it('activates only edges between selected nodes for a multi-selection', () => {
    const result = createFlowEdges({
      appearance,
      edges,
      selectedNodeIds: new Set(['a', 'b']),
    });

    expect(result.map(({ animated, markerEnd, style }) => ({
      animated,
      markerEnd,
      stroke: style?.stroke,
    }))).toEqual([
      {
        animated: false,
        markerEnd: { color: '#ddd', type: 'arrowclosed' },
        stroke: '#ddd',
      },
      {
        animated: true,
        markerEnd: { color: '#111', type: 'arrowclosed' },
        stroke: '#111',
      },
      {
        animated: false,
        markerEnd: { color: '#ddd', type: 'arrowclosed' },
        stroke: '#ddd',
      },
      {
        animated: false,
        markerEnd: { color: '#ddd', type: 'arrowclosed' },
        stroke: '#ddd',
      },
    ]);
  });

  it('activates only directed path edges between explicitly selected nodes', () => {
    const result = createFlowEdges({
      appearance,
      directedPathEdgeIds: new Set(['a->b', 'b->c']),
      edges,
      explicitlySelectedIds: new Set(['a', 'c']),
      selectedNodeIds: new Set(['a', 'b', 'c']),
    });

    expect(result.map(({ animated, style }) => ({
      animated,
      color: style?.stroke,
    }))).toEqual([
      { animated: false, color: '#ddd' },
      { animated: true, color: '#111' },
      { animated: false, color: '#ddd' },
      { animated: true, color: '#222' },
    ]);
  });
});
