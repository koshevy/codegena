import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/react';

import { GitHubInvertocatIcon } from './github-invertocat-icon';

const meta: Meta<typeof GitHubInvertocatIcon> = {
  component: GitHubInvertocatIcon,
  render: () => (
    <Box
      aria-label="GitHub logo"
      role="img"
      sx={{ width: 32 }}
    >
      <GitHubInvertocatIcon />
    </Box>
  ),
  title: 'Codegena/Unified UI/Icons/GitHub Invertocat',
};

export default meta;

export const Light: StoryObj<typeof GitHubInvertocatIcon> = {};

export const Dark: StoryObj<typeof GitHubInvertocatIcon> = {
  parameters: { codegenaTheme: 'dark' },
};
