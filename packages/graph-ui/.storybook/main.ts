import type { StorybookConfig } from '@storybook/react-vite';
import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  staticDirs: [{
    from: '../src/lib/__fixtures__',
    to: '/fixtures',
  }],
  addons: ['@storybook/addon-docs'],
  // Generate prop metadata outside Vite's per-module transform loop.
  features: { experimentalDocgenServer: true },
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    defaultName: 'README',
  },
  viteFinal: (viteConfig) => mergeConfig(viteConfig, {
    optimizeDeps: {
      include: ['@codegena/oas3-visitor-typescript'],
    },
    resolve: {
      alias: {
        '@codegena/oas3-visitor-typescript': fileURLToPath(new URL(
          '../../oas3-visitor-typescript/src/index.ts',
          import.meta.url,
        )),
      },
      tsconfigPaths: true,
    },
  }),
};

export default config;
