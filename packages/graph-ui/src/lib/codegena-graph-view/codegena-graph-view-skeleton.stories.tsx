import type { Meta, StoryObj } from '@storybook/react';

import { CodegenaGraphViewSkeleton } from './codegena-graph-view-skeleton';

const meta: Meta<typeof CodegenaGraphViewSkeleton> = {
  component: CodegenaGraphViewSkeleton,
  title: 'Codegena/Graph View/Loading',
};

export default meta;

export const Light: StoryObj<typeof CodegenaGraphViewSkeleton> = {};

export const Dark: StoryObj<typeof CodegenaGraphViewSkeleton> = {
  parameters: { codegenaTheme: 'dark' },
};
