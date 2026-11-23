import type { GraphPayloadGroupNode } from '@codegena/graph-core';
import { convertFixtureToGraph } from '@codegena/graph-core/testing-utils';
import type { Meta, StoryObj } from '@storybook/react';

import { GraphNodeStory } from './story-utils';

const meta: Meta<typeof GraphNodeStory> = {
  component: GraphNodeStory,
  loaders: async () => {
    const { graph } = await convertFixtureToGraph(
      'json-schema-from-internet-geometry.jsonc',
    );
    const node = graph.nodes.find((candidate): candidate is GraphPayloadGroupNode => (
      candidate.data.kind === 'group'
      && candidate.data.fileName === 'geometry.ts'
    ));

    if (!node) {
      throw new Error('The geometry story needs its generated file node.');
    }

    return { data: node.data };
  },
  render: (args, { loaded }) => (
    <GraphNodeStory
      {...args}
      data={loaded['data']}
    />
  ),
  title: 'Codegena/Nodes/File',
};

export default meta;

export const Default: StoryObj<typeof GraphNodeStory> = {};

export const LongFileName: StoryObj<typeof GraphNodeStory> = {
  render: (args, { loaded }) => (
    <GraphNodeStory
      {...args}
      data={{
        ...loaded['data'],
        fileName: 'json-schema-from-internet-geometry.generated.ts',
        label: 'json-schema-from-internet-geometry.generated.ts',
      }}
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
      data={{ ...loaded['data'], hideUnconnectedHandles: true }}
    />
  ),
};
