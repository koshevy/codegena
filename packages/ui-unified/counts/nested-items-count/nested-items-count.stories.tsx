import type { Meta, StoryObj } from '@storybook/react';

import { NestedItemsCount } from './nested-items-count';

const meta: Meta<typeof NestedItemsCount> = {
  args: {
    items: [
      { count: 2, singular: 'directory', plural: 'directories' },
      { count: 3, singular: 'file', plural: 'files' },
    ],
  },
  component: NestedItemsCount,
  title: 'Codegena/Unified UI/Counts/Nested Items Count',
};

export default meta;

export const DirectoryContents: StoryObj<typeof NestedItemsCount> = {};

export const FileDeclarations: StoryObj<typeof NestedItemsCount> = {
  args: {
    items: [{ count: 3, singular: 'declaration', plural: 'declarations' }],
  },
};
