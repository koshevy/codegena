import type { History } from 'history';
import { Component, type ComponentClass, type ReactElement, type ReactNode } from 'react';
import { Router } from 'react-router';

import { useDocumentationHistory } from './use-documentation-history';
import type { DocumentationNavigation } from '../navigation';

interface Router5Props {
  children: ReactNode;
  history: History<unknown>;
}

// Docusaurus runs a Router 5 class, while shared ambient types describe Router 7.
function isPrivateRouter(value: unknown): value is ComponentClass<Router5Props> {
  return typeof value === 'function' && value.prototype instanceof Component;
}

const privateRouter: unknown = Router;

if (!isPrivateRouter(privateRouter)) {
  throw new TypeError('Documentation requires its private React Router 5 component.');
}

const Router5 = privateRouter;

interface EmbeddedDocumentationRouterProps {
  basename: string;
  children: ReactNode;
  navigation: DocumentationNavigation;
}

export function EmbeddedDocumentationRouter({
  basename,
  children,
  navigation,
}: EmbeddedDocumentationRouterProps): ReactElement {
  const history = useDocumentationHistory(basename, navigation);

  return (
    <Router5
      history={history}
    >
      {children}
    </Router5>
  );
}
