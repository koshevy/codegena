import type { Meta, StoryObj } from '@storybook/react';

import { GradientButton } from './gradient-button.styles';

const meta: Meta<typeof GradientButton> = {
  args: { children: 'Get started' },
  component: GradientButton,
  title: 'Codegena/Unified UI/Buttons/Gradient Button',
};

export default meta;

type Story = StoryObj<typeof GradientButton>;

export const CompactFilled: Story = {
  args: { size: 'small', variant: 'contained' },
};

export const CompactOutlined: Story = {
  args: { size: 'small', variant: 'outlined' },
};

export const LargeFilled: Story = {
  args: { size: 'large', variant: 'contained' },
};

export const LargeOutlined: Story = {
  args: { size: 'large', variant: 'outlined' },
};
