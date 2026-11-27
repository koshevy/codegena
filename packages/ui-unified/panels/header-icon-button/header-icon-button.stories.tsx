import type { Meta, StoryObj } from '@storybook/react';
import { SunMoon } from 'lucide-react';
import { fn } from 'storybook/test';

import { HeaderIconButton } from './header-icon-button';

const meta: Meta<typeof HeaderIconButton> = {
  args: {
    icon: <SunMoon aria-hidden />,
    label: 'Choose appearance',
    onClick: fn(),
  },
  component: HeaderIconButton,
  title: 'Codegena/Unified UI/Panels/Header Icon Button',
};

export default meta;

export const Action: StoryObj<typeof HeaderIconButton> = {};

export const MenuOpen: StoryObj<typeof HeaderIconButton> = {
  args: { expanded: true },
};

export const Dark: StoryObj<typeof HeaderIconButton> = {
  parameters: { codegenaTheme: 'dark' },
};
