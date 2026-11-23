import { convertFixtureToGraph } from '@codegena/graph-core/testing-utils';
import type { Meta, StoryObj } from '@storybook/react';

import { WarningDetailed } from './warning-detailed';

const meta: Meta<typeof WarningDetailed> = {
  component: WarningDetailed,
  loaders: () => convertFixtureToGraph(
    'account-with-warning.schema.jsonc',
  ),
  render: (args, { loaded }) => (
    <WarningDetailed
      {...args}
      log={loaded['graph'].logs[0]}
      sourceSchemaText={loaded['sourceSchemaText']}
    />
  ),
  title: 'Codegena/Playground/Warning Detailed',
};

export default meta;

export const WithSourceLocation: StoryObj<typeof WarningDetailed> = {};

export const WithoutSourceLocation: StoryObj<typeof WarningDetailed> = {
  render: (args, { loaded }) => (
    <WarningDetailed
      {...args}
      log={{
        level: 'warn',
        message: 'Source location unavailable for this warning.',
      }}
      sourceSchemaText={loaded['sourceSchemaText']}
    />
  ),
};
