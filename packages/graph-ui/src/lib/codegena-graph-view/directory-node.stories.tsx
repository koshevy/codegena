import type { GraphPayloadDirectoryNode } from '@codegena/graph-core';
import { convertFixtureToGraph } from '@codegena/graph-core/testing-utils';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { getDirectoryNodeDescription } from './get-directory-node-description';
import { GraphNodeStory } from './story-utils';

const meta: Meta<typeof GraphNodeStory> = {
  args: { onToggleDirectory: fn() },
  component: GraphNodeStory,
  loaders: async () => {
    const { graph } = await convertFixtureToGraph(
      'oas3-onepassword-connect.json',
    );
    const directory = graph.nodes.find(
      (node): node is GraphPayloadDirectoryNode => (
        node.data.kind === 'directory' && node.id === 'items'
      ),
    );

    if (!directory) {
      throw new Error('The 1Password story needs the items directory.');
    }

    const children = graph.nodes.filter((node) => (
      'parentId' in node && node.parentId === directory.id
      && node.data.kind !== 'item'
    ));
    const directoryCount = children.filter(({ data }) => (
      data.kind === 'directory'
    )).length;

    return {
      data: {
        ...directory.data,
        description: getDirectoryNodeDescription(
          directoryCount,
          children.length - directoryCount,
        ),
      },
    };
  },
  render: (args, { loaded }) => (
    <GraphNodeStory
      {...args}
      data={loaded['data']}
    />
  ),
  title: 'Codegena/Nodes/Directory',
};

export default meta;

export const Collapsed: StoryObj<typeof GraphNodeStory> = {};

export const Expanded: StoryObj<typeof GraphNodeStory> = {
  args: { initiallyExpanded: true },
};

export const Dark: StoryObj<typeof GraphNodeStory> = {
  parameters: { codegenaTheme: 'dark' },
};
