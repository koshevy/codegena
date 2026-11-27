import type { Meta, StoryObj } from '@storybook/react';

import { ThemedScrollAreaExample } from './story-utils';

const meta: Meta<typeof ThemedScrollAreaExample> = {
  args: { autoHide: 'never' },
  component: ThemedScrollAreaExample,
  title: 'Codegena/Unified UI/Scrolling/Themed Scroll Area',
};

export default meta;

export const Light: StoryObj<typeof ThemedScrollAreaExample> = {};

export const AutoHide: StoryObj<typeof ThemedScrollAreaExample> = {
  args: { autoHide: 'move' },
};

export const Dark: StoryObj<typeof ThemedScrollAreaExample> = {
  parameters: { codegenaTheme: 'dark' },
};
