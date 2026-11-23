import { createLocation, createPath, type History, type LocationListener } from 'history';

import type { DocumentationLocation, DocumentationNavigation } from '../navigation';

export function getDocumentationLocation(
  location: DocumentationLocation,
  basename: string,
): DocumentationLocation {
  const basePath = basename.replace(/\/+$/, '');
  const isWithinBase = location.pathname === basePath
    || location.pathname.startsWith(`${basePath}/`);
  const pathname = isWithinBase
    ? location.pathname.slice(basePath.length) || '/'
    : location.pathname;

  return { ...location, pathname };
}

/**
 * Adapts Router 5's location, listeners, and blockers to the host browser router.
 * It mirrors the current location without keeping a second navigation stack.
 */
export function createDocumentationHistory(
  basename: string,
  navigation: DocumentationNavigation,
): {
  history: History<unknown>;
  updateLocation: (
    location: DocumentationLocation,
    action: DocumentationNavigation['action'],
  ) => void;
} {
  const basePath = basename.replace(/\/+$/, '');
  const listeners = new Set<LocationListener<unknown>>();
  const { block, go, navigate } = navigation;

  const history: History<unknown> = {
    action: navigation.action,
    length: 1,
    location: getDocumentationLocation(navigation.location, basePath),
    createHref: (location) => `${basePath}${createPath(location)}`,
    push: (location, state) => {
      const destination = createLocation(location, state, undefined, history.location);

      navigate(history.createHref(destination), { state: destination.state });
    },
    replace: (location, state) => {
      const destination = createLocation(location, state, undefined, history.location);

      navigate(history.createHref(destination), {
        replace: true,
        state: destination.state,
      });
    },
    go,
    goBack: () => go(-1),
    goForward: () => go(1),
    block: (prompt) => {
      if (typeof prompt === 'string') {
        throw new TypeError('Embedded documentation requires a navigation callback.');
      }

      return block((location, action) => {
        const relativeLocation = getDocumentationLocation(location, basePath);

        return (typeof prompt === 'function'
          ? prompt(relativeLocation, action)
          : prompt) !== false;
      });
    },
    listen: (listener) => {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
  };

  return {
    history,
    updateLocation: (location, action) => {
      history.location = getDocumentationLocation(location, basePath);
      history.action = action;
      listeners.forEach((listener) => listener(history.location, action));
    },
  };
}
