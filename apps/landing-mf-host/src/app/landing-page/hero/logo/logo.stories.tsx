import type { Meta, StoryObj } from '@storybook/react';

import { Logo } from './logo';

const meta: Meta<typeof Logo> = {
  args: { isAnimated: true },
  component: Logo,
  parameters: { codegenaTheme: 'dark' },
  title: 'Codegena/Landing/Branding/Logo',
};

export default meta;

export const FlowingColors: StoryObj<typeof Logo> = {};

export const Still: StoryObj<typeof Logo> = {
  args: { isAnimated: false },
};
