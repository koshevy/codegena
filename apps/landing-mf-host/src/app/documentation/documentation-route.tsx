import type { ReactElement } from 'react';
import { useLoaderData } from 'react-router-dom';

import type { DocumentationRemoteModule } from './load-documentation';
import { useDocumentationNavigation } from './use-documentation-navigation';
import { useAppearance } from '../appearance';

export function DocumentationRoute(): ReactElement {
  const {
    mode,
    setMode,
  } = useAppearance();

  const { default: Documentation } = useLoaderData<DocumentationRemoteModule>();

  const navigation = useDocumentationNavigation();

  return (
    <Documentation
      appearance={{ mode, onModeChange: setMode }}
      basename="/docs"
      navigation={navigation}
    />
  );
}
