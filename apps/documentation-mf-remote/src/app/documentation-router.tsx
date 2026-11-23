import type { ReactElement, ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { EmbeddedDocumentationRouter } from './embedded-documentation-router';
import type { DocumentationNavigation } from '../navigation';

interface DocumentationRouterProps {
  basename: string;
  children: ReactNode;
  navigation?: DocumentationNavigation;
}

export function DocumentationRouter({
  basename,
  children,
  navigation,
}: DocumentationRouterProps): ReactElement {
  if (navigation) {
    return (
      <EmbeddedDocumentationRouter
        basename={basename}
        navigation={navigation}
      >
        {children}
      </EmbeddedDocumentationRouter>
    );
  }

  return <BrowserRouter basename={basename}>{children}</BrowserRouter>;
}
