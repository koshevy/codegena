import type { Meta, StoryObj } from '@storybook/react';

import { CodegenaLogo } from './codegena-logo';

const meta: Meta<typeof CodegenaLogo> = {
  args: { subtitle: 'Schema playground' },
  component: CodegenaLogo,
  title: 'Codegena/Unified UI/Branding/Codegena Logo',
};

export default meta;

export const WithSubtitle: StoryObj<typeof CodegenaLogo> = {};

export const MarkAndName: StoryObj<typeof CodegenaLogo> = {
  args: { subtitle: undefined },
};

export const Dark: StoryObj<typeof CodegenaLogo> = {
  parameters: { codegenaTheme: 'dark' },
};
