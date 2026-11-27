import { type MouseEventHandler, useCallback, useContext } from 'react';

import { DocumentationHostContext } from './documentation-host-context';

/**
 * Keep article fragments in the host history, including its mobile-menu blocker.
 * Standalone docs retain Docusaurus's native anchor behavior.
 */
export function useArticleAnchorNavigation(): MouseEventHandler<HTMLDivElement> {
  const { navigation } = useContext(DocumentationHostContext);

  return useCallback((event): void => {
    if (!navigation || !(event.target instanceof Element)) {
      return;
    }

    const isModifiedClick = event.altKey
      || event.ctrlKey
      || event.metaKey
      || event.shiftKey;
    const hasToKeepNativeAction = event.defaultPrevented
      || event.button !== 0
      || isModifiedClick;

    if (hasToKeepNativeAction) {
      return;
    }

    const anchor = event.target.closest<HTMLAnchorElement>('a[href^="#"]');
    const hash = anchor?.getAttribute('href');
    const hasExternalTarget = !!anchor?.target && anchor.target !== '_self';

    if (!hash || hasExternalTarget || anchor?.hasAttribute('download')) {
      return;
    }

    event.preventDefault();

    const { pathname, search } = navigation.location;

    navigation.navigate(`${pathname}${search}${hash}`);
  }, [navigation]);
}
