import type { Meta, StoryObj } from '@storybook/react';

import { PlaygroundConvertingPlaceholder } from './playground-converting-placeholder';

const meta: Meta<typeof PlaygroundConvertingPlaceholder> = {
  component: PlaygroundConvertingPlaceholder,
  title: 'Codegena/Playground/Converting Placeholder',
};

export default meta;

export const Light: StoryObj<typeof PlaygroundConvertingPlaceholder> = {};

export const Dark: StoryObj<typeof PlaygroundConvertingPlaceholder> = {
  parameters: { codegenaTheme: 'dark' },
};
