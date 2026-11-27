import type { GraphSearchSource } from '@codegena/graph-search-core';
import {
  createContext,
  type ReactElement,
  type ReactNode,
  useContext,
  useMemo,
} from 'react';

export type SearchSuggestionsSource = GraphSearchSource;

const emptySuggestionsSource: SearchSuggestionsSource = () => ({
  isTruncated: false,
  suggestions: [],
});

const noUpdates = (): (() => void) => () => {
  // A static source has no subscription to remove.
};
const initialVersion = (): number => 0;

interface SearchSuggestionsContext {
  getVersion: () => number;
  source: SearchSuggestionsSource;
  subscribe: (listener: () => void) => () => void;
}

const SearchSuggestionsSourceContext = createContext<SearchSuggestionsContext>({
  getVersion: initialVersion,
  source: emptySuggestionsSource,
  subscribe: noUpdates,
});

export interface SearchSuggestionsSourceProviderProps {
  children: ReactNode;
  getVersion?: () => number;
  source: SearchSuggestionsSource;
  subscribe?: (listener: () => void) => () => void;
}

export function SearchSuggestionsSourceProvider({
  children,
  getVersion = initialVersion,
  source,
  subscribe = noUpdates,
}: SearchSuggestionsSourceProviderProps): ReactElement {
  const value = useMemo(() => ({ getVersion, source, subscribe }), [
    getVersion,
    source,
    subscribe,
  ]);

  return (
    <SearchSuggestionsSourceContext.Provider
      value={value}
    >
      {children}
    </SearchSuggestionsSourceContext.Provider>
  );
}

export function useSearchSuggestionsSource(): SearchSuggestionsContext {
  return useContext(SearchSuggestionsSourceContext);
}
