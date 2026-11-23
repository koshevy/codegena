import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { merge } from 'webpack-merge';

import federationConfig from './module-federation.config.js';

const appBuildId = process.env['CODEGENA_BUILD_ID'] ?? randomUUID();

const require = createRequire(import.meta.url);
const docusaurusRequire = createRequire(require.resolve('@docusaurus/core/package.json'));
const HtmlWebpackPlugin = docusaurusRequire('html-webpack-plugin');

function getDevelopmentPort() {
  const { values } = parseArgs({
    options: { port: { type: 'string', short: 'p' } },
    allowPositionals: true,
    strict: false,
  });

  return Number(values.port ?? 8103);
}

export function configureDocumentationRspack(config, isServer, siteDir, currentBundler) {
  const extension = createDocumentationRspackConfig(siteDir, isServer, currentBundler);

  Object.assign(config, merge(config, extension));

  config.plugins?.forEach((plugin) => {
    if (plugin instanceof HtmlWebpackPlugin) {
      plugin.options.excludeChunks = ['documentation_mf_remote'];
    }
  });
}

export function createDocumentationRspackConfig(siteDir, isServer, currentBundler) {
  const resolveOptions = {
    tsConfig: { configFile: resolve(siteDir, 'tsconfig.app.json') },
    alias: {
      '@theme/Root': resolve(siteDir, 'src/dev-mode/index.ts'),
      '@theme/CodeBlock': resolve(siteDir, 'src/theme/code-block.tsx'),
      '@theme/Footer': resolve(siteDir, 'src/theme/footer.tsx'),
      '@theme/Navbar/Logo': resolve(siteDir, 'src/theme/navbar-logo.tsx'),
      '@theme/Navbar/ColorModeToggle': resolve(siteDir, 'src/theme/navbar-actions.tsx'),
      '@theme/NavbarItem/ComponentTypes': resolve(
        siteDir,
        'src/theme/navbar-item-types.ts',
      ),
      '@theme/Layout/Provider': resolve(siteDir, 'src/theme/layout-provider.tsx'),
      '@theme/BlogListPage': resolve(siteDir, 'src/theme/blog-list.tsx'),
    },
  };

  const experiments = {
    cache: {
      buildDependencies: [
        resolve(siteDir, 'documentation-root-class.mjs'),
        resolve(siteDir, 'scope-documentation-css.mjs'),
        resolve(siteDir, 'patches/react-loadable+6.0.0.patch'),
        resolve(siteDir, 'patches/@docusaurus+theme-classic+3.10.2.patch'),
      ],
    },
  };

  const environmentPlugin = new currentBundler.instance.DefinePlugin({
    CODEGENA_BUILD_ID: JSON.stringify(appBuildId),
  });

  if (isServer) {
    return { resolve: resolveOptions, experiments, plugins: [environmentPlugin] };
  }

  return {
    entry: resolve(siteDir, 'src/main.ts'),
    output: { uniqueName: 'documentation_mf_remote', publicPath: 'auto' },
    devServer: {
      client: {
        webSocketURL: { hostname: '127.0.0.1', port: getDevelopmentPort() },
      },
    },
    resolve: resolveOptions,
    optimization: {
      runtimeChunk: false,
      splitChunks: { cacheGroups: { common: false } },
    },
    experiments,
    plugins: [
      environmentPlugin,
      new currentBundler.instance.ProvidePlugin({
        'window.docusaurus': [
          require.resolve('@docusaurus/core/lib/client/docusaurus'),
          'default',
        ],
      }),
      new ModuleFederationPlugin({
        ...federationConfig,
        library: { type: 'window', name: 'documentation_mf_remote' },
        filename: 'remoteEntry.js',
        shared: {
          '@codegena/util-dev-mode': { singleton: true },
          'react': { singleton: true },
          'react-dom': { singleton: true },
          'react/jsx-runtime': { singleton: true, requiredVersion: false },
          'react/jsx-dev-runtime': { singleton: true, requiredVersion: false },
          '@emotion/react': { singleton: true },
          '@emotion/styled': { singleton: true },
        },
        // Workspace types resolve from source without a federation type-reload broker.
        dev: false,
        dts: {
          consumeTypes: false,
          generateTypes: {
            tsConfigPath: resolve(siteDir, 'tsconfig.app.json'),
            outputDir: resolve(siteDir, '../../dist/apps/documentation-mf-remote'),
            deleteTypesFolder: true,
            abortOnError: true,
          },
        },
      }),
    ],
  };
}
