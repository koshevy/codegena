import { useLayoutEffect, useState } from 'react';

import { createDocumentationHistory } from './create-documentation-history';
import type { DocumentationNavigation } from '../navigation';

export function useDocumentationHistory(
  basename: string,
  navigation: DocumentationNavigation,
): ReturnType<typeof createDocumentationHistory>['history'] {
  const [adapter] = useState(() => createDocumentationHistory(basename, navigation));

  const { action, location } = navigation;

  useLayoutEffect(() => {
    adapter.updateLocation(location, action);
  }, [
    action,
    adapter,
    location,
  ]);

  return adapter.history;
}
