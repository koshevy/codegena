import type { Meta, StoryObj } from '@storybook/react';

import { Wordmark } from './wordmark';

const meta: Meta<typeof Wordmark> = {
  component: Wordmark,
  title: 'Codegena/Unified UI/Branding/Wordmark',
};

export default meta;

export const Animated: StoryObj<typeof Wordmark> = {};

export const Static: StoryObj<typeof Wordmark> = {
  args: { isAnimated: false },
};

export const Dark: StoryObj<typeof Wordmark> = {
  parameters: { codegenaTheme: 'dark' },
};
