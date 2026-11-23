import type { StorybookConfig } from '@storybook/react-vite';
import { randomUUID } from 'node:crypto';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  staticDirs: [
    { from: '../src/assets', to: '/assets' },
    {
      from: dirname(fileURLToPath(
        import.meta.resolve('@codegena/ui-theme/assets/reset.css'),
      )),
      to: '/assets/ui-theme',
    },
    { from: '../../../dist/apps/landing-mf-host-services', to: '/' },
    { from: '../../../dist/apps/playground-mf-remote', to: '/playground-remote' },
    { from: '../../../dist/apps/playground-mf-remote/monaco', to: '/monaco' },
    {
      from: '../../../dist/apps/playground-mf-remote/specifications',
      to: '/specifications',
    },
    { from: '../../../dist/apps/playground-mf-remote-services', to: '/' },
  ],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: (viteConfig) => {
    const buildId = process.env['CODEGENA_BUILD_ID'] ?? randomUUID();

    return mergeConfig(viteConfig, {
      define: { CODEGENA_BUILD_ID: JSON.stringify(buildId) },
      optimizeDeps: { exclude: ['@tanstack/highlight'] },
      resolve: { tsconfigPaths: true },
    });
  },
};

export default config;
