import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/react';

import { SearchDrawerPeelTab } from './search-drawer-peel-tab';

const meta: Meta<typeof SearchDrawerPeelTab> = {
  args: { onClick: () => null },
  component: SearchDrawerPeelTab,
  decorators: [
    (Story) => (
      <Box sx={{ position: 'relative', textAlign: 'center' }}>
        <Story />
      </Box>
    ),
  ],
  title: 'Codegena/Graph Search/Peel Tab',
};

export default meta;

export const Default: StoryObj<typeof SearchDrawerPeelTab> = {};
