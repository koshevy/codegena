import { convertFixtureToGraph } from '@codegena/graph-core/testing-utils';
import type { Meta, StoryObj } from '@storybook/react';

import { WarningsList } from './warnings-list';

const meta: Meta<typeof WarningsList> = {
  component: WarningsList,
  render: (args, { loaded }) => (
    <WarningsList
      {...args}
      logs={loaded['graph'].logs}
      sourceSchemaText={loaded['sourceSchemaText']}
    />
  ),
  title: 'Codegena/Playground/Warnings List',
};

export default meta;

export const OneWarning: StoryObj<typeof WarningsList> = {
  loaders: () => convertFixtureToGraph(
    'account-with-warning.schema.jsonc',
  ),
};

export const MultipleWarnings: StoryObj<typeof WarningsList> = {
  loaders: () => convertFixtureToGraph('comprehensive.jsonc'),
};
