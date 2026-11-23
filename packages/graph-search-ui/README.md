# Graph Search UI

`@codegena/graph-search-ui` provides floating search for generated files,
directories, declarations, warnings, and specification snippets. It owns the
search form and suggestion presentation. The embedding feature owns what
happens after a suggestion is chosen.

## Explore the states

Run `npm exec -- nx run @codegena/graph-search-ui:storybook`, then open:

- **Search:** the peel tab, open drawer, and dark appearance.
- **Drawer:** normal and overflowing suggestions. Long lists scroll within the
  page, leaving space below the search field and at the screen bottom.
- **Autocomplete:** matching suggestions and the **No results found** state.
- **Suggestion Items:** each entity type, including a numbered code excerpt
  with the matched word highlighted.

Item stories use fixed suggestions so each state is reproducible. Playground's
stories use `@codegena/graph-search-core` to search their generated graphs.

## Embed search

Provide a function that receives the current search text and returns matching
items with a flag indicating whether more matches were omitted.
`@codegena/graph-search-core` supplies that function in Playground.

```tsx
import {
  GraphSearch,
  SearchSuggestionsSourceProvider,
  type SearchSuggestionsSource,
} from '@codegena/graph-search-ui';

const source: SearchSuggestionsSource = (query) => ({
  isTruncated: false,
  suggestions: query ? [] : [
    {
      id: 'models',
      kind: 'directory',
      title: './models',
      directoryCount: 0,
      fileCount: 3,
    },
  ],
});

<SearchSuggestionsSourceProvider source={source}>
  <GraphSearch onAutocompleteSelect={(item) => revealItem(item)} />
</SearchSuggestionsSourceProvider>;
```

The item contract permits a graph node ID or source location for navigation.
File, declaration, and specification items can include a numbered code excerpt.
File titles show the full path; declarations show their filename beneath the
name. A warning uses its graph log message as the title, with no description.
The source decides which items match; `GraphSearch` reports the selected item to
its caller.

## Verify

- `npm exec -- nx run @codegena/graph-search-ui:lint`
- `npm exec -- nx run @codegena/graph-search-ui:test`
- `npm exec -- nx run @codegena/graph-search-ui:build`
- `npm exec -- nx run playground-ui-e2e:e2e` for the composed search journey

The [local ADR](adr/README.md) explains the boundary between suggestion UI and
host navigation. The [Playground test catalogue](../../apps/playground-ui-e2e/TESTCASES.md)
tracks the browser path.
