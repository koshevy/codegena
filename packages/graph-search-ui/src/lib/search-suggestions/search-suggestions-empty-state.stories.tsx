import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/react';

import { SearchSuggestionsEmptyState } from './search-suggestions-empty-state';

const meta: Meta<typeof SearchSuggestionsEmptyState> = {
  component: SearchSuggestionsEmptyState,
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: '50rem', width: '100%' }}>
        <Story />
      </Box>
    ),
  ],
  title: 'Codegena/Graph Search/Empty State',
};

export default meta;

export const NoMatches: StoryObj<typeof SearchSuggestionsEmptyState> = {};
