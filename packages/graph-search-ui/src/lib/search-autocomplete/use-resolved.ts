import { useEffect, useState } from 'react';

import type {
  SearchSuggestionsSource,
  SearchAutocompleteItem,
} from '../search-suggestions';

interface ResolvedSuggestions {
  isTruncated: boolean;
  query: string;
  suggestions: SearchAutocompleteItem[];
}

export function useResolved(
  query: string,
  source: SearchSuggestionsSource,
  version: number,
): ResolvedSuggestions {
  const [resolved, setResolved] = useState<ResolvedSuggestions>({
    isTruncated: false,
    query: '',
    suggestions: [],
  });

  useEffect(() => {
    let isCurrent = true;

    void Promise.resolve(source(query)).then((result) => {
      if (isCurrent) {
        setResolved({ ...result, query });
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [
    query,
    source,
    version,
  ]);

  return resolved;
}
