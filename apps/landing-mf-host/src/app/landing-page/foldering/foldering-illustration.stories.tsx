import type { Meta, StoryObj } from '@storybook/react';

import { FolderingIllustration } from './foldering-illustration';

const meta: Meta<typeof FolderingIllustration> = {
  component: FolderingIllustration,
  parameters: { codegenaTheme: 'dark' },
  title: 'Codegena/Landing/Foldering illustration',
};

export default meta;

export const OnePasswordDirectories: StoryObj<typeof FolderingIllustration> = {};
