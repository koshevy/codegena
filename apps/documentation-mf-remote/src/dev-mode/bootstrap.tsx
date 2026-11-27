import { DevModeEnvContext } from '@codegena/util-dev-mode';
import { type ReactElement, type ReactNode, useContext } from 'react';

import { devModeEnv } from '../environment';
import { DocumentationHostContext } from '../navigation';

/**
 * Docusaurus mounts this root in standalone and federated pages.
 * Embedded documentation retains the host's execution flags.
 */
export default function DocumentationRoot({
  children,
}: { children: ReactNode }): ReactElement {
  const hostDevModeEnv = useContext(DevModeEnvContext);
  const { navigation } = useContext(DocumentationHostContext);
  const value = navigation ? hostDevModeEnv : devModeEnv;

  return (
    <DevModeEnvContext.Provider value={value}>
      {children}
    </DevModeEnvContext.Provider>
  );
}
