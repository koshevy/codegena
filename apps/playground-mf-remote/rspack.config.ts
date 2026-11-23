import {
  getMonacoBootstrapPath,
  monacoFeatureRule,
  monacoOptions,
} from '@codegena/ui-unified/monaco-webpack';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { NxAppRspackPlugin } from '@nx/rspack/app-plugin.js';
import { NxReactRspackPlugin } from '@nx/rspack/react-plugin.js';
import type { Configuration } from '@rspack/core';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';

import { browserServicesConfig } from './browser-services.config';
import federationConfig from './module-federation.config';

export default async function createRemoteConfig(
  env: Record<string, unknown> = {},
): Promise<Configuration[]> {
  const { CopyRspackPlugin, DefinePlugin } = await import('@rspack/core');
  const appBuildId = process.env['CODEGENA_BUILD_ID'] ?? randomUUID();
  const isProduction = !env['RSPACK_SERVE'];
  const mode = isProduction ? 'production' : 'development';

  const application: Configuration = {
    name: 'playground',
    dependencies: ['browser-services'],
    mode,
    lazyCompilation: false,
    output: {
      path: join(__dirname, '../../dist/apps/playground-mf-remote'),
      publicPath: 'auto',
      uniqueName: 'playground_mf_remote',
    },
    resolve: {
      alias: {
        'monaco-editor/esm/vs/editor/editor.main.js$': getMonacoBootstrapPath(__dirname),
      },
    },
    module: { rules: [monacoFeatureRule] },
    devServer: {
      port: 8101,
      headers: { 'Access-Control-Allow-Origin': '*' },
      historyApiFallback: {
        index: '/index.html',
        disableDotRule: true,
        htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
      },
      client: { overlay: { errors: true, warnings: false } },
    },
    plugins: [
      new DefinePlugin({ CODEGENA_BUILD_ID: JSON.stringify(appBuildId) }),
      new NxAppRspackPlugin({
        cache: false,
        // The federation entry must initialize without the standalone page runtime.
        runtimeChunk: false,
        mode,
        tsConfig: './tsconfig.app.json',
        main: './src/main.ts',
        index: './src/index.html',
        baseHref: '/',
        assets: [],
        styles: [],
        outputHashing: isProduction ? 'all' : 'none',
        optimization: isProduction,
      }),
      new NxReactRspackPlugin({ reactRefresh: !isProduction }),
      new CopyRspackPlugin({
        patterns: [
          {
            from: join(__dirname, '../../dist/apps/playground-mf-remote-services'),
            to: '.',
            info: { minimized: true },
          },
          {
            from: join(__dirname, './src/assets/specifications/pet-store.json'),
            to: 'specifications/pet-store.json',
          },
          {
            from: join(__dirname, '../../packages/oas3-visitor-typescript',
              'src/__fixtures__/oas3-api-github-com.json'),
            to: 'specifications/github.json',
          },
          {
            from: join(__dirname,
              '../../packages/playground-ui/src/lib/__fixtures__/account.schema.jsonc'),
            to: 'specifications/account.schema.jsonc',
          },
          {
            from: join(__dirname, '../../packages/playground-ui/src/lib',
              '__fixtures__/oas3-onepassword-connect.json'),
            to: 'specifications/one-password.json',
          },
        ],
      }),
      new MonacoWebpackPlugin(monacoOptions),
      new ModuleFederationPlugin({
        ...federationConfig,
        filename: 'remoteEntry.js',
        shared: {
          '@codegena/util-dev-mode': { singleton: true },
          'react': { singleton: true },
          'react-dom': { singleton: true },
          'react-router-dom': { singleton: true },
          'react/jsx-runtime': { singleton: true, requiredVersion: false },
          'react/jsx-dev-runtime': { singleton: true, requiredVersion: false },
        },
        // Workspace types resolve from source without a federation type-reload broker.
        dev: false,
        dts: {
          consumeTypes: false,
          generateTypes: {
            tsConfigPath: join(__dirname, 'tsconfig.app.json'),
            deleteTypesFolder: true,
            abortOnError: true,
          },
        },
      }),
    ],
  };

  return [application, { ...browserServicesConfig, mode }];
}
