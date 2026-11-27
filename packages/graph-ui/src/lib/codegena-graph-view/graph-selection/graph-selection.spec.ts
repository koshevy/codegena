import {
  deselectSelectedNode,
  getSelectedNodeIds,
  toggleSelectedNode,
} from '@codegena/graph-core';

import { comprehensiveGraph, geometryGraph } from '../__mocks__';

describe('graph selection', () => {
  it('deselects a single declaration even when its file was selected explicitly', () => {
    const remaining = deselectSelectedNode(
      geometryGraph,
      new Set(['position.ts']),
      'position.ts::Position',
    );

    expect([...remaining]).toEqual([]);
  });

  it('deselects a file and its explicitly selected declarations', () => {
    const remaining = deselectSelectedNode(
      comprehensiveGraph,
      new Set(['first-level.ts', 'first-level.ts::FirstLevel', 'zero-level.ts']),
      'first-level.ts',
    );

    expect([...remaining]).toEqual(['zero-level.ts']);
  });

  it('toggles a clicked group and resets the selection without Shift', () => {
    const selected = toggleSelectedNode(
      geometryGraph,
      new Set<string>(),
      'geometry.ts',
      false,
    );

    expect([...selected]).toEqual(['geometry.ts']);

    const cleared = toggleSelectedNode(geometryGraph, selected, 'geometry.ts', false);
    const replaced = toggleSelectedNode(geometryGraph, selected, 'position.ts', false);

    expect([...cleared]).toEqual([]);
    expect([...replaced]).toEqual(['position.ts']);
  });

  it('adds and removes individual groups with Shift', () => {
    const first = toggleSelectedNode(
      geometryGraph,
      new Set<string>(),
      'geometry.ts',
      false,
    );
    const both = toggleSelectedNode(geometryGraph, first, 'position.ts', true);
    const remaining = toggleSelectedNode(geometryGraph, both, 'geometry.ts', true);

    expect([...both]).toEqual(['geometry.ts', 'position.ts']);
    expect([...remaining]).toEqual(['position.ts']);
  });

  it('selects a file when all its datatypes are selected', () => {
    const children = comprehensiveGraph.nodes.filter((node) => (
      node.data.kind === 'item'
      && 'parentId' in node
      && node.parentId === 'first-level.ts'
    ));
    const explicitIds = new Set(children.map(({ id }) => id));
    const selectedIds = getSelectedNodeIds(comprehensiveGraph, explicitIds);

    expect(children.length).toBeGreaterThan(1);
    expect(selectedIds.has('first-level.ts')).toBe(true);

    const afterGroupClick = toggleSelectedNode(
      comprehensiveGraph,
      explicitIds,
      'first-level.ts',
      true,
    );

    expect(getSelectedNodeIds(comprehensiveGraph, afterGroupClick).size).toBe(0);
  });

  it('selects a file independently of its datatypes', () => {
    const explicitIds = toggleSelectedNode(
      comprehensiveGraph,
      new Set<string>(),
      'first-level.ts',
      false,
    );
    const selectedIds = getSelectedNodeIds(comprehensiveGraph, explicitIds);

    expect([...selectedIds]).toEqual(['first-level.ts']);
  });

  it('selects a single-datatype file and its datatype independently', () => {
    const explicitIds = toggleSelectedNode(
      geometryGraph,
      new Set<string>(),
      'position.ts::Position',
      false,
    );
    const selectedIds = getSelectedNodeIds(geometryGraph, explicitIds);

    expect([...selectedIds].toSorted()).toEqual([
      'position.ts',
      'position.ts::Position',
    ]);

    const onlyGroupExplicit = toggleSelectedNode(
      geometryGraph,
      explicitIds,
      'position.ts',
      false,
    );

    expect([...onlyGroupExplicit]).toEqual(['position.ts']);
    expect([...getSelectedNodeIds(geometryGraph, onlyGroupExplicit)].toSorted()).toEqual([
      'position.ts',
      'position.ts::Position',
    ]);

    const onlyDatatypeExplicit = toggleSelectedNode(
      geometryGraph,
      onlyGroupExplicit,
      'position.ts::Position',
      false,
    );

    expect([...onlyDatatypeExplicit]).toEqual(['position.ts::Position']);

    const bothExplicit = toggleSelectedNode(
      geometryGraph,
      onlyDatatypeExplicit,
      'position.ts',
      true,
    );

    expect([...bothExplicit].toSorted()).toEqual([
      'position.ts',
      'position.ts::Position',
    ]);

    const groupRemains = toggleSelectedNode(
      geometryGraph,
      bothExplicit,
      'position.ts::Position',
      true,
    );

    expect([...groupRemains]).toEqual(['position.ts']);

    const datatypeRemains = toggleSelectedNode(
      geometryGraph,
      bothExplicit,
      'position.ts',
      true,
    );

    expect([...datatypeRemains]).toEqual(['position.ts::Position']);
  });
});
