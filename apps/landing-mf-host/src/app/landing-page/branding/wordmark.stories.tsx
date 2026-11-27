import type { Meta, StoryObj } from '@storybook/react';

import { Wordmark } from './index';

const meta: Meta<typeof Wordmark> = {
  args: { isAnimated: true },
  component: Wordmark,
  parameters: { codegenaTheme: 'dark' },
  title: 'Codegena/Landing/Branding/Wordmark',
};

export default meta;

export const Default: StoryObj<typeof Wordmark> = {};

export const Still: StoryObj<typeof Wordmark> = {
  args: { isAnimated: false },
};
