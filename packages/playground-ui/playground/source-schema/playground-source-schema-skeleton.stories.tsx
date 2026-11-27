import type { Meta, StoryObj } from '@storybook/react';

import { PlaygroundSourceSchemaSkeleton } from './playground-source-schema-skeleton';

const meta: Meta<typeof PlaygroundSourceSchemaSkeleton> = {
  component: PlaygroundSourceSchemaSkeleton,
  title: 'Codegena/Playground/Source editor loading',
};

export default meta;

export const Light: StoryObj<typeof PlaygroundSourceSchemaSkeleton> = {};

export const Dark: StoryObj<typeof PlaygroundSourceSchemaSkeleton> = {
  parameters: { codegenaTheme: 'dark' },
};
