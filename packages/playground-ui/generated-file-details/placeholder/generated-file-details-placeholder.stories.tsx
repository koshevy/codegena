import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/react';
import type { ReactElement } from 'react';
import { fn } from 'storybook/test';

import { GeneratedFileDetailsPlaceholder } from './generated-file-details-placeholder';

const meta: Meta<typeof GeneratedFileDetailsPlaceholder> = {
  args: { onShowAllFiles: fn() },
  component: GeneratedFileDetailsPlaceholder,
  decorators: [(Story): ReactElement => (
    <Box sx={{ display: 'flex', height: '70vh', maxWidth: 480 }}>
      <Story />
    </Box>
  )],
  title: 'Codegena/Playground/Generated File Details Placeholder',
};

export default meta;

export const Light: StoryObj<typeof GeneratedFileDetailsPlaceholder> = {};

export const Dark: StoryObj<typeof GeneratedFileDetailsPlaceholder> = {
  parameters: { codegenaTheme: 'dark' },
};
