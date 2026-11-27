import { convertFixtureToGraph } from '@codegena/graph-core/testing-utils';
import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { GeneratedFilesList } from './generated-files-list';

const meta: Meta<typeof GeneratedFilesList> = {
  args: { onSelectChange: fn() },
  component: GeneratedFilesList,
  render: (args, { loaded }) => (
    <GeneratedFilesList
      {...args}
      graph={loaded['graph']}
    />
  ),
  title: 'Codegena/Playground/Generated Files List',
};

export default meta;

export const Default: StoryObj<typeof GeneratedFilesList> = {
  loaders: () => convertFixtureToGraph('account.schema.jsonc'),
};

export const WithTitle: StoryObj<typeof GeneratedFilesList> = {
  args: { title: 'Generated files' },
  loaders: () => convertFixtureToGraph('account.schema.jsonc'),
};

export const BySource: StoryObj<typeof GeneratedFilesList> = {
  args: { sortMode: 'source' },
  loaders: () => convertFixtureToGraph('oas3-onepassword-connect.json'),
};

export const Selected: StoryObj<typeof GeneratedFilesList> = {
  args: { defaultSelectedNodeIds: ['account.ts::Account'] },
  loaders: () => convertFixtureToGraph('account.schema.jsonc'),
};

export const WithDirectories: StoryObj<typeof GeneratedFilesList> = {
  loaders: () => convertFixtureToGraph('oas3-onepassword-connect.json'),
};

export const ConstrainedDirectories: StoryObj<typeof GeneratedFilesList> = {
  loaders: () => convertFixtureToGraph('oas3-onepassword-connect.json'),
  render: (args, { loaded }) => (
    <Box
      sx={{ height: '70vh', width: '18rem' }}
    >
      <GeneratedFilesList
        {...args}
        graph={loaded['graph']}
      />
    </Box>
  ),
};

export const SelectedNestedDeclaration: StoryObj<typeof GeneratedFilesList> = {
  args: {
    defaultSelectedNodeIds: [
      'items/_common/generator-recipe.ts::GeneratorRecipe',
    ],
  },
  loaders: () => convertFixtureToGraph('oas3-onepassword-connect.json'),
};
