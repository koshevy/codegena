import { createMonacoViteConfig } from '@codegena/ui-unified/monaco-vite';
import type { StorybookConfig } from '@storybook/react-vite';
import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vite';

import { browserServicesPlugin } from './browser-services-plugin.ts';

const config: StorybookConfig = {
  stories: [
    '../converting-placeholder/**/*.stories.@(ts|tsx)',
    '../generated-file-details/**/*.stories.@(ts|tsx)',
    '../generated-files-list/**/*.stories.@(ts|tsx)',
    '../json-editor/**/*.stories.@(ts|tsx)',
    '../misc-ui/**/*.stories.@(ts|tsx)',
    '../playground/**/*.stories.@(ts|tsx)',
  ],
  staticDirs: [
    {
      from: '../src/lib/__fixtures__',
      to: '/fixtures',
    },
    {
      from: '../json-editor/__fixtures__',
      to: '/fixtures',
    },
    {
      from: '../../oas3-visitor-typescript/src/__fixtures__',
      to: '/visitor-fixtures',
    },
  ],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    defaultName: 'README',
  },
  viteFinal: (viteConfig) => {
    const monacoConfig = mergeConfig(viteConfig, createMonacoViteConfig());

    return mergeConfig(monacoConfig, {
      plugins: [browserServicesPlugin()],
      optimizeDeps: {
        // Fixed worker URLs are outside Storybook's initial dependency scan.
        include: [
          '@codegena/oas3-visitor-typescript',
          '@hono/service-worker',
          'hono',
          'hono/body-limit',
          'hono/http-exception',
          'hono/router/trie-router',
        ],
      },
      server: {
        watch: {
          ignored: ['**/storybook-static/**'],
        },
      },
      resolve: {
        alias: {
          '@codegena/oas3-visitor-typescript': fileURLToPath(new URL(
            '../../oas3-visitor-typescript/src/index.ts',
            import.meta.url,
          )),
          'decode-named-character-reference': fileURLToPath(
            import.meta.resolve('decode-named-character-reference'),
          ),
        },
        tsconfigPaths: true,
      },
    });
  },
};

export default config;
