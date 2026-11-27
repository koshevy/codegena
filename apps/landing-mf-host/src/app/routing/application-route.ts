import { createElement } from 'react';
import type { RouteObject } from 'react-router-dom';

import { ApplicationLayout, type ApplicationLayoutProps } from './application-layout';

export function createApplicationRoute(
  layoutProps: ApplicationLayoutProps,
  children: RouteObject[],
): RouteObject {
  return {
    id: 'landing-layout',
    element: createElement(ApplicationLayout, layoutProps),
    children,
  };
}
