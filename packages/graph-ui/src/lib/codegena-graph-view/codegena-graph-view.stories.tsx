import type { GraphPayload } from '@codegena/graph-core';
import { convertFixtureToGraph } from '@codegena/graph-core/testing-utils';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { CodegenaGraphView } from './codegena-graph-view';

function getSingleFileGraph(graph: GraphPayload): GraphPayload {
  const nodes = graph.nodes.filter((node) => (
    node.id === 'geometry.ts'
    || ('parentId' in node && node.parentId === 'geometry.ts')
  ));
  const nodeIds = new Set(nodes.map(({ id }) => id));

  return {
    ...graph,
    edges: graph.edges.filter(({ source, target }) => (
      nodeIds.has(source) && nodeIds.has(target)
    )),
    nodes,
  };
}

const meta: Meta<typeof CodegenaGraphView> = {
  args: {
    height: '100vh',
    onSelectChange: fn(),
  },
  component: CodegenaGraphView,
  render: (args, { loaded }) => (
    <CodegenaGraphView
      {...args}
      graph={loaded['graph']}
    />
  ),
  title: 'Codegena/Graph View',
};

export default meta;

export const Geometry: StoryObj<typeof CodegenaGraphView> = {
  loaders: () => convertFixtureToGraph('json-schema-from-internet-geometry.jsonc'),
};

export const GeometryDark: StoryObj<typeof CodegenaGraphView> = {
  parameters: { codegenaTheme: 'dark' },
  loaders: () => convertFixtureToGraph('json-schema-from-internet-geometry.jsonc'),
};

export const ShowUnconnectedHandles: StoryObj<typeof CodegenaGraphView> = {
  loaders: async () => {
    const { graph } = await convertFixtureToGraph(
      'json-schema-from-internet-geometry.jsonc',
    );

    return {
      graph: {
        ...graph,
        nodes: graph.nodes.map((node) => ({
          ...node,
          data: { ...node.data, hideUnconnectedHandles: false },
        })),
      },
    };
  },
};

export const CoreVocabulary: StoryObj<typeof CodegenaGraphView> = {
  loaders: () => convertFixtureToGraph('core-vocabulary-meta-schema.jsonc', {
    mode: 'singleFile',
  }),
};

export const Comprehensive: StoryObj<typeof CodegenaGraphView> = {
  loaders: () => convertFixtureToGraph('comprehensive.jsonc'),
};

export const SingleFile: StoryObj<typeof CodegenaGraphView> = {
  args: { title: 'Single generated file' },
  loaders: async () => {
    const { graph } = await convertFixtureToGraph(
      'json-schema-from-internet-geometry.jsonc',
    );

    return { graph: getSingleFileGraph(graph) };
  },
};

export const Empty: StoryObj<typeof CodegenaGraphView> = {
  args: { title: 'Empty graph' },
  loaders: async () => {
    const { graph } = await convertFixtureToGraph(
      'json-schema-from-internet-geometry.jsonc',
    );

    return { graph: { ...graph, edges: [], logs: [], nodes: [] } };
  },
};
