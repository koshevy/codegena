import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { WarningIconButton } from './warning-icon-button';

const meta: Meta<typeof WarningIconButton> = {
  args: {
    ariaLabel: 'Reveal warnings',
    onClick: fn(),
    title: 'Has warnings (click to reveal)',
  },
  component: WarningIconButton,
  title: 'Codegena/Unified UI/Icons/Warning Icon Button',
};

export default meta;

export const Light: StoryObj<typeof WarningIconButton> = {};

export const Dark: StoryObj<typeof WarningIconButton> = {
  parameters: { codegenaTheme: 'dark' },
};
