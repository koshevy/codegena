import type { Meta, StoryObj } from '@storybook/react';

import { SearchSuggestionsSourceProvider } from '../search-suggestions';
import { SearchDrawer } from './search-drawer';
import {
  demoSearchSuggestionsSource,
  overflowingSearchSuggestionsSource,
} from '../../story-utils/demo-search-suggestions-source';

const meta: Meta<typeof SearchDrawer> = {
  args: {
    onAutocompleteSelect: () => null,
    onClose: () => null,
    open: true,
  },
  component: SearchDrawer,
  decorators: [
    (Story) => (
      <SearchSuggestionsSourceProvider source={demoSearchSuggestionsSource}>
        <Story />
      </SearchSuggestionsSourceProvider>
    ),
  ],
  title: 'Codegena/Graph Search/Drawer',
};

export default meta;

export const Open: StoryObj<typeof SearchDrawer> = {};

export const OverflowingSuggestions: StoryObj<typeof SearchDrawer> = {
  render: (args) => (
    <SearchSuggestionsSourceProvider source={overflowingSearchSuggestionsSource}>
      <SearchDrawer {...args} />
    </SearchSuggestionsSourceProvider>
  ),
};
