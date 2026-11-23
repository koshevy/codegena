import { convertFixtureToGraph } from '@codegena/graph-core/testing-utils';
import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import referenceNavigationSchemaText from
  './__fixtures__/reference-navigation.jsonc?raw';
import { JsonEditor } from './json-editor';

const meta: Meta<typeof JsonEditor> = {
  args: {
    onRevealNode: fn(),
    onRevealWarning: fn(),
  },
  component: JsonEditor,
  decorators: [(Story) => <Box sx={{ height: '85vh' }}><Story /></Box>],
  render: (args, { loaded }) => (
    <JsonEditor
      {...args}
      graph={loaded['graph']}
      sourceSchemaText={loaded['sourceSchemaText']}
    />
  ),
  title: 'Codegena/Playground/JSON Editor',
};

export default meta;

export const Default: StoryObj<typeof JsonEditor> = {
  loaders: () => convertFixtureToGraph('account.schema.jsonc'),
};

export const WarningWithoutDeclaration: StoryObj<typeof JsonEditor> = {
  loaders: () => convertFixtureToGraph(
    'account-with-warning.schema.jsonc',
  ),
};

export const ReferenceNavigation: StoryObj<typeof JsonEditor> = {
  render: (args) => (
    <JsonEditor
      {...args}
      graph={undefined}
      sourceSchemaText={referenceNavigationSchemaText}
    />
  ),
};
