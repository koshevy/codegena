import DocusaurusApp from '@docusaurus/core/lib/client/App';
import { type ReactElement, useMemo } from 'react';
import { HelmetProvider } from 'react-helmet-async';

import { DocumentationRouter } from './documentation-router';
import { DocumentationHostContext, type DocumentationHostProps } from '../navigation';

export interface DocumentationAppProps extends DocumentationHostProps {
  basename?: string;
}

export default function App({
  appearance,
  basename = '/',
  navigation,
}: DocumentationAppProps): ReactElement {
  const host = useMemo(() => ({ appearance, navigation }), [
    appearance,
    navigation,
  ]);

  return (
    <HelmetProvider>
      <DocumentationHostContext.Provider value={host}>
        <DocumentationRouter
          basename={basename}
          navigation={navigation}
        >
          <DocusaurusApp />
        </DocumentationRouter>
      </DocumentationHostContext.Provider>
    </HelmetProvider>
  );
}
