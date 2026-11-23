import type { Meta, StoryObj } from '@storybook/react';

import { GitHubLink } from './github-link';

const meta: Meta<typeof GitHubLink> = {
  args: { href: 'https://github.com/koshevy/codegena' },
  component: GitHubLink,
  title: 'Codegena/Unified UI/Branding/GitHub Link',
};

export default meta;

export const Repository: StoryObj<typeof GitHubLink> = {};
