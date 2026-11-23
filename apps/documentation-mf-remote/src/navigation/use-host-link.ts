import { type MouseEvent, useCallback, useContext } from 'react';
import { useLocation } from 'react-router-dom';

import { DocumentationHostContext } from './documentation-host-context';

export function useHostLink(
  path: string,
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void,
): (event: MouseEvent<HTMLAnchorElement>) => void {
  const { navigation } = useContext(DocumentationHostContext);
  const { search } = useLocation();

  return useCallback((event): void => {
    onClick?.(event);

    const isModifiedClick = event.altKey
      || event.ctrlKey
      || event.metaKey
      || event.shiftKey;
    const hasToNavigate = navigation
      && event.button === 0
      && !isModifiedClick
      && !event.defaultPrevented;

    if (hasToNavigate) {
      event.preventDefault();
      navigation.navigate(`${path}${search}`);
    }
  }, [
    navigation,
    onClick,
    path,
    search,
  ]);
}
