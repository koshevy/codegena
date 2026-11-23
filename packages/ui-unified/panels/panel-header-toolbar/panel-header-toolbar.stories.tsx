import type { Meta, StoryObj } from '@storybook/react';
import { GitBranch, ListTree } from 'lucide-react';
import { fn } from 'storybook/test';

import { PanelHeaderToolbar } from './panel-header-toolbar';

const meta: Meta<typeof PanelHeaderToolbar> = {
  args: {
    ariaLabel: 'Generated output view',
    onChange: fn(),
    options: [
      { icon: (
        <ListTree
          aria-hidden
          size={17}
        />
      ), title: 'List', value: 'list' },
      { icon: (
        <GitBranch
          aria-hidden
          size={17}
        />
      ), title: 'Graph', value: 'graph' },
    ],
    value: 'graph',
  },
  component: PanelHeaderToolbar,
  title: 'Codegena/Unified UI/Panels/Panel Header Toolbar',
};

export default meta;

export const GraphSelected: StoryObj<typeof PanelHeaderToolbar> = {};

export const ListSelected: StoryObj<typeof PanelHeaderToolbar> = {
  args: { value: 'list' },
};
