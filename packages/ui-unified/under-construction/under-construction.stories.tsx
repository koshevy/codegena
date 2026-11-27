import type { Meta, StoryObj } from '@storybook/react';

import { UnderConstruction } from './under-construction';

const meta: Meta<typeof UnderConstruction> = {
  args: {
    children: <button type="button">Continue reading</button>,
    disclamerText: [
      'Site under construction until December\u{a0}15.',
      'Content may be incomplete or inaccurate.',
    ].join(' '),
  },
  component: UnderConstruction,
  title: 'Codegena/Unified UI/Under Construction',
};

export default meta;

export const Light: StoryObj<typeof UnderConstruction> = {
  parameters: { codegenaTheme: 'light' },
};

export const Dark: StoryObj<typeof UnderConstruction> = {
  parameters: { codegenaTheme: 'dark' },
};
