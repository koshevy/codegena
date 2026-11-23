import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/react';
import { TriangleAlert } from 'lucide-react';
import { fn } from 'storybook/test';

import { BottomFloatingButton } from './bottom-floating-button';

const meta: Meta<typeof BottomFloatingButton> = {
  args: {
    ariaLabel: 'Scroll to warnings',
    color: 'warning',
    icon: (
      <TriangleAlert
        aria-hidden
        size={15}
      />
    ),
    label: 'Has warnings',
    onClick: fn(),
  },
  component: BottomFloatingButton,
  render: (args) => (
    <Box sx={{ height: 180, position: 'relative' }}>
      <BottomFloatingButton {...args} />
    </Box>
  ),
  title: 'Codegena/Unified UI/Panels/Bottom Floating Button',
};

export default meta;

export const Warning: StoryObj<typeof BottomFloatingButton> = {};

export const Primary: StoryObj<typeof BottomFloatingButton> = {
  args: { color: 'primary', label: 'Show details' },
};

export const Dark: StoryObj<typeof BottomFloatingButton> = {
  parameters: { codegenaTheme: 'dark' },
};
