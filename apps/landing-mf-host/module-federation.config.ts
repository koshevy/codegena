import type { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'landing-mf-host',
  remotes: [
    ['playground-mf-remote', '/playground-remote'],
    ['documentation-mf-remote', '/documentation-remote'],
  ],
  shared: (libraryName, sharedConfig) => {
    const isSharedRuntime = [
      'react',
      'react-dom',
      '@emotion/react',
      '@emotion/styled',
      '@codegena/util-dev-mode',
    ].includes(libraryName);

    return isSharedRuntime ? sharedConfig : false;
  },
  additionalShared: [
    ['react/jsx-runtime', { singleton: true, requiredVersion: false }],
    ['react/jsx-dev-runtime', { singleton: true, requiredVersion: false }],
  ],
};

export default config;
