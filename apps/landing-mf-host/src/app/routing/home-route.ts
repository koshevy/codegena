import { createElement, type ReactElement } from 'react';
import type { RouteObject } from 'react-router-dom';

export const homeRouteId = 'landing-home';

function loadLandingPage(): Promise<typeof import('../landing-page')> {
  return import(
    /* webpackChunkName: "landing-shell" */ '../landing-page'
  );
}

export async function loadHydratableLanding(root: HTMLElement): Promise<ReactElement> {
  const { LandingPageRoute, readLandingPreview } = await loadLandingPage();

  return createElement(LandingPageRoute, { preview: readLandingPreview(root) });
}

export function createHomeRoute(appBuildId: string, element?: ReactElement): RouteObject {
  const lazy = element
    ? undefined
    : async () => {
      const { LandingPageRoute } = await loadLandingPage();

      return { Component: LandingPageRoute };
    };

  return {
    id: homeRouteId,
    path: '/',
    loader: () => appBuildId,
    element,
    lazy,
  };
}
