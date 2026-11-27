import { BundleWarmupPlugin } from '@codegena/pwa/rspack';
import {
  NxModuleFederationPlugin,
} from '@nx/module-federation/rspack';
import { NxAppRspackPlugin } from '@nx/rspack/app-plugin.js';
import { NxReactRspackPlugin } from '@nx/rspack/react-plugin.js';
import type { Configuration } from '@rspack/core';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

import { browserServicesConfig } from './browser-services.config';
import bundleWarmupConfig from './bundle-warmup';
import config from './module-federation.config';
import { resetStylesheetUrlPlugin } from './reset-stylesheet.config';

export default async function createLandingConfig(
  env: Record<string, unknown> = {},
): Promise<Configuration[]> {
  const {
    CopyRspackPlugin,
    DefinePlugin,
  } = await import('@rspack/core');
  const buildId = process.env['CODEGENA_BUILD_ID']
    ?? process.env['NX_TASK_HASH']
    ?? randomUUID();
  const isProduction = !env['RSPACK_SERVE'];
  const mode = isProduction ? 'production' : 'development';
  const configRequire = createRequire(__filename);
  const resetStylesPath = configRequire.resolve('@codegena/ui-theme/assets/reset.css');

  const warmupOptions = {
    buildId,
    chunkGroups: bundleWarmupConfig.chunkGroups,
    clientShellGroup: bundleWarmupConfig.clientShellGroup,
    manifestPath: bundleWarmupConfig.manifestPath,
    remotePath: bundleWarmupConfig.remotePath,
  };
  const warmupPlugins = isProduction
    ? [new BundleWarmupPlugin(warmupOptions)]
    : [];

  const landingConfig: Configuration = {
    name: 'landing',
    dependencies: ['browser-services'],
    mode,
    // rspack-cli dev mode defaults this on; it breaks module federation.
    lazyCompilation: false,
    output: {
      path: join(__dirname, '../../dist/apps/landing-mf-host'),
      publicPath: '/',
    },
    devServer: {
      client: {
        overlay: { errors: true, warnings: false },
      },
      port: 8102,
      historyApiFallback: {
        index: '/index.html',
        disableDotRule: true,
        htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
      },
    },
    plugins: [
      new DefinePlugin({
        CODEGENA_BUILD_ID: JSON.stringify(buildId),
      }),
      new NxAppRspackPlugin({
        cache: false,
        mode,
        tsConfig: './tsconfig.app.json',
        main: './src/main.ts',
        index: './src/index.html',
        baseHref: '',
        assets: ['./src/assets'],
        styles: [],
        outputHashing: isProduction ? 'all' : 'none',
        optimization: isProduction,
      }),
      new NxReactRspackPlugin({ reactRefresh: !isProduction }),
      new CopyRspackPlugin({
        patterns: [
          {
            from: dirname(resetStylesPath),
            to: 'assets/ui-theme',
            globOptions: { ignore: ['**/reset.css'] },
          },
          {
            from: resetStylesPath,
            to: 'assets/ui-theme/[name].[contenthash:16][ext]',
          },
          { from: './src/manifest.webmanifest', to: 'manifest.webmanifest' },
          {
            from: join(__dirname, '../../dist/apps/landing-mf-host-services'),
            to: '.',
            info: { minimized: true },
          },
          {
            from: join(__dirname, '../../dist/apps/playground-mf-remote'),
            to: 'playground-remote',
            globOptions: {
              ignore: [
                '**/index.html',
                '**/monaco/**',
                '**/specifications/**',
                '**/service-worker*',
                '**/graph-search-api.js',
                '**/specification-*',
                '**/services/**',
              ],
            },
            info: { minimized: true },
          },
          {
            from: join(__dirname, '../../dist/apps/playground-mf-remote-services'),
            to: '.',
            globOptions: { ignore: ['**/service-worker*', '**/graph-search-api.js'] },
            info: { minimized: true },
          },
          {
            from: join(__dirname, '../../dist/apps/playground-mf-remote/monaco'),
            to: 'monaco',
            info: { minimized: true },
          },
          {
            from: join(__dirname, '../../dist/apps/playground-mf-remote/specifications'),
            to: 'specifications',
          },
          {
            from: join(__dirname, '../../dist/apps/documentation-mf-remote'),
            to: 'documentation-remote',
            globOptions: { ignore: ['**/*.html'] },
            info: { minimized: true },
          },
        ],
      }),
      resetStylesheetUrlPlugin,
      ...warmupPlugins,
      new NxModuleFederationPlugin({ config }, {
        dts: false,
        shareStrategy: 'loaded-first',
      }),
    ],
  };

  return [landingConfig, { ...browserServicesConfig, mode }];
}
