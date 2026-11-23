import Link from '@mui/material/Link';
import type { Meta, StoryObj } from '@storybook/react';

import { SiteFooter } from './site-footer';
import { CodegenaWordmark } from '../wordmark';

const meta: Meta<typeof SiteFooter> = {
  args: {
    navigation: [
      { href: '#docs', label: 'Docs' },
      { href: '#playground', label: 'Playground' },
    ],
    policies: [
      { href: '#security', label: 'Security' },
      { href: '#privacy', label: 'Personal data privacy' },
    ],
  },
  component: SiteFooter,
  title: 'Codegena/Unified UI/Branding/Site Footer',
};

export default meta;

export const Light: StoryObj<typeof SiteFooter> = {};

export const Dark: StoryObj<typeof SiteFooter> = {
  parameters: { codegenaTheme: 'dark' },
};

export const LinkedBrand: StoryObj<typeof SiteFooter> = {
  args: {
    brand: (
      <Link
        aria-label="Codegena home"
        href="/"
      >
        <CodegenaWordmark />
      </Link>
    ),
  },
};
