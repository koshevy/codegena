import type { Meta, StoryObj } from '@storybook/react';

import { RouteLoading } from './route-loading';

const meta: Meta<typeof RouteLoading> = {
  component: RouteLoading,
  title: 'Codegena/Landing/Routing/Loading',
};

export default meta;

export const Landing: StoryObj<typeof RouteLoading> = {
  args: { label: 'Loading Codegena' },
};

export const Documentation: StoryObj<typeof RouteLoading> = {
  args: { label: 'Loading documentation' },
};
