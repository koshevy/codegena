import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from 'storybook/test';

import { SearchSuggestionsSourceProvider } from '../search-suggestions';
import { GraphSearch } from './graph-search';
import {
  demoSearchSuggestionsSource,
} from '../../story-utils/demo-search-suggestions-source';

const meta: Meta<typeof GraphSearch> = {
  args: { onAutocompleteSelect: () => null },
  component: GraphSearch,
  decorators: [
    (Story) => (
      <SearchSuggestionsSourceProvider source={demoSearchSuggestionsSource}>
        <Box sx={{ height: '100vh', position: 'relative' }}>
          <Story />
        </Box>
      </SearchSuggestionsSourceProvider>
    ),
  ],
  title: 'Codegena/Graph Search/Search',
};

export default meta;

export const PeelTab: StoryObj<typeof GraphSearch> = {};

export const OpenedSearch: StoryObj<typeof GraphSearch> = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', {
      name: 'Search in files and directories',
    }));
  },
};

export const DoubleShiftShortcut: StoryObj<typeof GraphSearch> = {
  play: async () => {
    await userEvent.keyboard('{Shift>}{/Shift}{Shift>}{/Shift}');
  },
};

export const Dark: StoryObj<typeof GraphSearch> = {
  parameters: { codegenaTheme: 'dark' },
};
