import { PlaygroundConvertingPlaceholder }
  from '@codegena/playground-ui/converting-placeholder';
import {
  createBrowserRouter,
  redirect,
  type RouteObject,
} from 'react-router-dom';

import { ApplicationLayout } from './application-layout';
import { createSpecificationLoader } from './create-specification-loader';
import { RouteError } from './route-error';
import { getSpecificationPath, specificationExamples } from './specification-examples';

export function createAppRouter(
  appBuildId: string,
): ReturnType<typeof createBrowserRouter> {
  const routes: RouteObject[] = [{
    Component: ApplicationLayout,
    ErrorBoundary: RouteError,
    HydrateFallback: PlaygroundConvertingPlaceholder,
    children: [
      {
        index: true,
        Component: PlaygroundConvertingPlaceholder,
        loader: () => redirect(getSpecificationPath(specificationExamples[0].path)),
      },
      {
        path: 'playground/:specUrl',
        ErrorBoundary: RouteError,
        lazy: async () => {
          const {
            Component,
            initializeMonaco,
          } = await import('../playground-route');

          initializeMonaco();

          return { Component };
        },
        loader: createSpecificationLoader(appBuildId),
      },
    ],
  }];

  return createBrowserRouter(routes);
}
