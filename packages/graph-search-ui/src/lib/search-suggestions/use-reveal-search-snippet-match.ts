import { type RefObject, useLayoutEffect } from 'react';

import {
  searchSuggestionsCodeSnippetClasses,
} from './search-suggestions-code-snippet.styles';
import type {
  SearchSuggestionsCodeSnippet,
} from './search-suggestions-item.props';

export function useRevealSearchSnippetMatch(
  viewportRef: RefObject<HTMLDivElement | null>,
  snippet: SearchSuggestionsCodeSnippet,
  query: string,
): void {
  const { activeColumnNumber, activeLineNumber } = snippet;

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const match = viewport?.querySelector<HTMLElement>(
      `.${searchSuggestionsCodeSnippetClasses.active} mark`,
    );

    if (!viewport || !match || viewport.scrollWidth <= viewport.clientWidth) {
      return;
    }

    const viewportBounds = viewport.getBoundingClientRect();
    const matchBounds = match.getBoundingClientRect();
    const isMatchVisible = matchBounds.left >= viewportBounds.left
      && matchBounds.right <= viewportBounds.right;

    if (isMatchVisible) {
      return;
    }

    viewport.scrollLeft += matchBounds.left - viewportBounds.left
      - (viewport.clientWidth - matchBounds.width) / 2;
  }, [
    activeColumnNumber,
    activeLineNumber,
    query,
    viewportRef,
  ]);
}
