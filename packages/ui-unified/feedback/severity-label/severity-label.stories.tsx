import type { Meta, StoryObj } from '@storybook/react';

import { SeverityLabel } from './severity-label';

const meta: Meta<typeof SeverityLabel> = {
  args: {
    label: 'schema.jsonc:1526:21',
    severity: 'warning',
  },
  component: SeverityLabel,
  title: 'Codegena/Unified UI/Feedback/Severity Label',
};

export default meta;

export const Warning: StoryObj<typeof SeverityLabel> = {};

export const Error: StoryObj<typeof SeverityLabel> = {
  args: { severity: 'error' },
};

export const Success: StoryObj<typeof SeverityLabel> = {
  args: { label: 'Generation complete', severity: 'success' },
};

export const Dark: StoryObj<typeof SeverityLabel> = {
  parameters: { codegenaTheme: 'dark' },
};
