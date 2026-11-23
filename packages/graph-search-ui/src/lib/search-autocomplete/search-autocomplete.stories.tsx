import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from 'storybook/test';

import {
  SearchSuggestionsSourceProvider,
  type SearchSuggestionsSource,
} from '../search-suggestions';
import { SearchAutocomplete } from './search-autocomplete';
import {
  demoSearchSuggestionsSource,
} from '../../story-utils/demo-search-suggestions-source';

const noResultsSource: SearchSuggestionsSource = () => ({
  isTruncated: false,
  suggestions: [],
});

const meta: Meta<typeof SearchAutocomplete> = {
  args: { onAutocompleteSelect: () => null },
  component: SearchAutocomplete,
  decorators: [
    (Story) => (
      <SearchSuggestionsSourceProvider source={demoSearchSuggestionsSource}>
        <Box sx={{ maxWidth: '50rem' }}>
          <Story />
        </Box>
      </SearchSuggestionsSourceProvider>
    ),
  ],
  title: 'Codegena/Graph Search/Autocomplete',
};

export default meta;

export const Suggestions: StoryObj<typeof SearchAutocomplete> = {};

export const NoResults: StoryObj<typeof SearchAutocomplete> = {
  decorators: [
    (Story) => (
      <SearchSuggestionsSourceProvider source={noResultsSource}>
        <Box sx={{ maxWidth: '50rem' }}>
          <Story />
        </Box>
      </SearchSuggestionsSourceProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByRole('combobox'), 'missing-file');
  },
};

export const DarkSuggestions: StoryObj<typeof SearchAutocomplete> = {
  parameters: { codegenaTheme: 'dark' },
};
