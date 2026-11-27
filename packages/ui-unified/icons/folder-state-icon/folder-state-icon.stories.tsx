import type { Meta, StoryObj } from '@storybook/react';

import { FolderStateIcon } from './folder-state-icon';

const meta: Meta<typeof FolderStateIcon> = {
  args: { isExpanded: false },
  component: FolderStateIcon,
  title: 'Codegena/Unified UI/Icons/Folder State Icon',
};

export default meta;

export const Closed: StoryObj<typeof FolderStateIcon> = {};

export const Open: StoryObj<typeof FolderStateIcon> = {
  args: { isExpanded: true },
};

export const Compact: StoryObj<typeof FolderStateIcon> = {
  args: { size: '1rem' },
};

export const Dark: StoryObj<typeof FolderStateIcon> = {
  parameters: { codegenaTheme: 'dark' },
};

export const DarkOpen: StoryObj<typeof FolderStateIcon> = {
  args: { isExpanded: true },
  parameters: { codegenaTheme: 'dark' },
};
