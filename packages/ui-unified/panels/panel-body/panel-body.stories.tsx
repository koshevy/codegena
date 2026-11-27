import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/react';

import { PanelBody } from './panel-body';

const meta: Meta<typeof PanelBody> = {
  component: PanelBody,
  title: 'Codegena/Unified UI/Panels/Panel Body',
};

export default meta;

export const WithContent: StoryObj<typeof PanelBody> = {
  args: {
    children: (
      <Box sx={{ padding: 2 }}>
        Content fills the space below a panel header.
      </Box>
    ),
  },
};
