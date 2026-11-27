import type {
  GraphPayload,
  GraphPayloadItemNode,
  GraphPayloadItemNodeData,
} from '@codegena/graph-core';
import { convertFixtureToGraph } from '@codegena/graph-core/testing-utils';
import type { Meta, StoryObj } from '@storybook/react';

import { GraphNodeStory } from './story-utils';

function getDatatypeData(
  graph: GraphPayload,
  identifierName: string,
): GraphPayloadItemNodeData {
  const node = graph.nodes.find((candidate): candidate is GraphPayloadItemNode => (
    candidate.data.kind === 'item'
    && candidate.data.identifierName === identifierName
  ));

  if (!node) {
    throw new Error(`The story needs ${identifierName} datatype node.`);
  }

  return node.data;
}

const meta: Meta<typeof GraphNodeStory> = {
  component: GraphNodeStory,
  loaders: async () => {
    const [geometry, comprehensive] = await Promise.all([
      convertFixtureToGraph('json-schema-from-internet-geometry.jsonc'),
      convertFixtureToGraph('comprehensive.jsonc'),
    ]);
    const warningNode = comprehensive.graph.nodes.find(
      (node): node is GraphPayloadItemNode => (
        node.data.kind === 'item'
        && node.data.logs.some(({ level }) => (
          level === 'warn' || level === 'error'
        ))
      ),
    );

    if (!warningNode) {
      throw new Error('The comprehensive story needs a datatype with logs.');
    }

    return {
      composition: getDatatypeData(
        comprehensive.graph,
        'InlineObjectCompositionProperties',
      ),
      position: getDatatypeData(geometry.graph, 'Position'),
      warning: warningNode.data,
    };
  },
  render: (args, { loaded }) => (
    <GraphNodeStory
      {...args}
      data={loaded['position']}
    />
  ),
  title: 'Codegena/Nodes/Datatype',
};

export default meta;

export const Default: StoryObj<typeof GraphNodeStory> = {};

export const WithWarnings: StoryObj<typeof GraphNodeStory> = {
  render: (args, { loaded }) => (
    <GraphNodeStory
      {...args}
      data={loaded['warning']}
    />
  ),
};

export const LongIdentifier: StoryObj<typeof GraphNodeStory> = {
  render: (args, { loaded }) => (
    <GraphNodeStory
      {...args}
      data={loaded['composition']}
    />
  ),
};

export const Dark: StoryObj<typeof GraphNodeStory> = {
  parameters: { codegenaTheme: 'dark' },
};

export const HideUnconnectedHandles: StoryObj<typeof GraphNodeStory> = {
  render: (args, { loaded }) => (
    <GraphNodeStory
      {...args}
      data={{ ...loaded['position'], hideUnconnectedHandles: true }}
    />
  ),
};
