import type { GraphSearchSource } from '@codegena/graph-search-core';
import { useEffect, useMemo } from 'react';

import { createGithubSearchSource } from './search-suggestions';

export function useGithubSearchSource(appBuildId: string): GraphSearchSource {
  const source = useMemo(() => createGithubSearchSource(appBuildId), [appBuildId]);

  useEffect(() => source.dispose, [source]);

  return source.getSuggestions;
}
