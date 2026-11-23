import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { PanelToggle } from './panel-toggle';

const meta: Meta<typeof PanelToggle> = {
  args: {
    isOpen: false,
    isVisible: true,
    onToggle: fn(),
    position: 'left',
    title: 'source schema',
  },
  component: PanelToggle,
  title: 'Codegena/Unified UI/Panels/Panel Toggle',
};

export default meta;

export const ShowSource: StoryObj<typeof PanelToggle> = {};

export const HideSource: StoryObj<typeof PanelToggle> = {
  args: { isOpen: true },
};

export const ShowDetails: StoryObj<typeof PanelToggle> = {
  args: { position: 'right', title: 'details' },
};

export const HideDetails: StoryObj<typeof PanelToggle> = {
  args: { isOpen: true, position: 'right', title: 'details' },
};
