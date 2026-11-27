import OriginalLayoutProvider from '@docusaurus/theme-classic/lib/theme/Layout/Provider';
import type { ReactElement, ReactNode } from 'react';

import { DocumentationTheme } from '../appearance';

export default function LayoutProvider({
  children,
}: { children: ReactNode }): ReactElement {
  return (
    <OriginalLayoutProvider>
      <DocumentationTheme>{children}</DocumentationTheme>
    </OriginalLayoutProvider>
  );
}
