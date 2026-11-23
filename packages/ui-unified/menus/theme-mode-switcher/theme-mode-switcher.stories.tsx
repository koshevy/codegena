import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { ThemeModeSwitcher } from './theme-mode-switcher';

const meta: Meta<typeof ThemeModeSwitcher> = {
  args: { mode: 'system', onChange: fn() },
  component: ThemeModeSwitcher,
  title: 'Codegena/Unified UI/Menus/Theme Mode Switcher',
};

export default meta;

export const System: StoryObj<typeof ThemeModeSwitcher> = {};
export const Light: StoryObj<typeof ThemeModeSwitcher> = { args: { mode: 'light' } };
export const Dark: StoryObj<typeof ThemeModeSwitcher> = {
  args: { mode: 'dark' },
  parameters: { codegenaTheme: 'dark' },
};
