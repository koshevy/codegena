import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { ShowHideButton } from './show-hide-button';

const meta: Meta<typeof ShowHideButton> = {
  args: {
    hideLabel: 'Hide source',
    isExpanded: false,
    onToggle: fn(),
    showLabel: 'Show source',
  },
  component: ShowHideButton,
  title: 'Codegena/Unified UI/Feedback/Show Hide Button',
};

export default meta;

export const Closed: StoryObj<typeof ShowHideButton> = {};

export const Open: StoryObj<typeof ShowHideButton> = {
  args: { isExpanded: true },
};
