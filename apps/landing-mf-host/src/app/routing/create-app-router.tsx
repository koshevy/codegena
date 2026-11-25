import { createElement, lazy, type ReactElement, Suspense } from 'react';
import {
  createBrowserRouter,
  type LoaderFunctionArgs,
  redirect,
} from 'react-router-dom';

import type { ApplicationLayoutProps } from './application-layout';
import { createApplicationRoute } from './application-route';
import { createHomeRoute, homeRouteId } from './home-route';
import type { LoadDocumentationRemote } from '../documentation';
import { defaultPlaygroundPath } from '../playground-examples';
import type { LoadPlaygroundRemote } from '../playground-remote';

const RouteError = lazy(async () => {
  const { RouteError: ErrorView } = await import('./route-error');

  return { default: ErrorView };
});

function redirectToPlayground({ request }: LoaderFunctionArgs): Response {
  const url = new URL(request.url);

  return redirect(`${defaultPlaygroundPath}${url.search}`);
}

interface CreateAppRouterOptions extends ApplicationLayoutProps {
  appBuildId: string;
  initialLanding?: ReactElement;
  loadDocumentation: LoadDocumentationRemote;
  loadPlayground: LoadPlaygroundRemote;
}

/**
 * One browser history owns the landing page, articles, and specification sessions.
 */
export function createAppRouter({
  appBuildId,
  extrasGroups,
  initialLanding,
  loadDocumentation,
  loadPlayground,
  warmAfterPaintedGroups,
}: CreateAppRouterOptions): ReturnType<typeof createBrowserRouter> {
  const route = createApplicationRoute({ extrasGroups, warmAfterPaintedGroups }, [
    createHomeRoute(appBuildId, initialLanding),
    {
      path: '/docs/*',
      lazy: async () => {
        const {
          createDocumentationLoader,
          DocumentationRoute,
        } = await import(
          /* webpackChunkName: "documentation-route" */ '../documentation'
        );

        return {
          Component: DocumentationRoute,
          loader: createDocumentationLoader(loadDocumentation),
        };
      },
    },
    { path: '/playground', loader: redirectToPlayground, element: null },
    {
      path: '/playground/:specUrl',
      lazy: async () => {
        const {
          createPlaygroundLoader,
          PlaygroundSession,
        } = await import(
          /* webpackChunkName: "playground-route" */ '../playground-remote'
        );

        return {
          Component: PlaygroundSession,
          loader: createPlaygroundLoader(appBuildId, loadPlayground),
        };
      },
    },
  ]);

  const hydrationData = initialLanding
    ? { loaderData: { [homeRouteId]: appBuildId } }
    : undefined;

  return createBrowserRouter([{
    ...route,
    errorElement: createElement(Suspense, { fallback: null }, createElement(RouteError)),
    // The HTML stylesheet owns loading feedback until this layout can mount.
    HydrateFallback: (): null => null,
  }], {
    hydrationData,
  });
}
