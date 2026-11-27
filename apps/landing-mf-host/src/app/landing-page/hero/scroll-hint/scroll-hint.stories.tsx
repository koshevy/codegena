import type { Meta, StoryObj } from '@storybook/react';

import { ScrollHint } from './scroll-hint';

const meta: Meta<typeof ScrollHint> = {
  component: ScrollHint,
  parameters: { codegenaTheme: 'dark' },
  title: 'Codegena/Landing/Hero/Scroll hint',
};

export default meta;

export const Default: StoryObj<typeof ScrollHint> = {};
