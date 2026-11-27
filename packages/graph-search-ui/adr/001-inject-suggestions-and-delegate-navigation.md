---
status: proposed
date: 2026-11-02
decision-makers: Codegena project maintainers
---

# Inject suggestions and delegate navigation

## Why

The same search form works in Storybook and Playground. It needs a replaceable
source of results without owning either host's selection state.

## Decision

> [!IMPORTANT]
> **The search library presents suggestions. Its caller supplies results and
> decides how a chosen item changes the application.**

- **🔎 Source:** A `SearchSuggestionsSource` **MUST** accept the current search
  text and return suggestion items plus an `isTruncated` flag. A React provider
  supplies it to the Autocomplete. The popup **MUST** explain when matching
  items were omitted. Component stories use fixed data; Playground uses the
  index in `@codegena/graph-search-core`.
- **🧩 Items:** Each item **MUST** identify its kind and title. Graph node IDs,
  source locations, counts, and numbered code excerpts describe the relevant
  result. File, directory, declaration, warning, and specification items have
  separate presentations. File titles show paths; declarations identify their
  file underneath. Warning titles use the graph log message without a second
  description. Matching words remain highlighted inside titles and code.
- **🧭 Navigation:** `GraphSearch` **MUST** report the chosen item through
  `onAutocompleteSelect`. Playground owns the resulting graph selection,
  editor navigation, and panel visibility. This keeps its cross-panel state
  out of the search library.
- **📐 Surface:** The Drawer stays centered, up to 50rem wide, with page-edge
  clearance. Long suggestion lists **MUST** scroll inside the visible page
  while leaving gaps below the Drawer and above the page bottom.

## Trade-offs

- **✅ Good:** Storybook can show stable states without generating a graph;
  host applications can supply their own search data and navigation.
- **⚠️ Cost:** Hosts must supply a source and handle selection. Graph Search
  Core provides the Playground source; small component stories still use fixed
  data to show exact visual states.

## Where to look

- [Suggestion source and provider](../src/lib/search-suggestions/search-suggestions-source.tsx)
- [Search composition](../src/lib/graph-search/graph-search.tsx)
- [Search engine decision](../../graph-search-core/adr/001-index-graph-suggestions-and-scope-visits-by-specification.md)
- [Playground navigation hook](../../playground-ui/search/use-playground-graph-search-selection.ts)

## Verification

- The five item stories, empty state, and long-list story render in Storybook.
- The Playground search browser path selects a declaration and opens its
  related panels.
