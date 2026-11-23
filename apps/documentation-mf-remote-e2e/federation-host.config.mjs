import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { HtmlRspackPlugin } from '@rspack/core';
import { resolve } from 'node:path';

export default {
  mode: process.env['DOCUMENTATION_E2E_SERVER'] === 'production'
    ? 'production'
    : 'development',
  context: import.meta.dirname,
  entry: './src/__fixtures__/federation-host/main.ts',
  output: {
    path: resolve(
      import.meta.dirname,
      '../../dist/apps/documentation-mf-remote-e2e/host',
    ),
    publicPath: 'auto',
    uniqueName: 'documentation_test_host',
    clean: true,
  },
  resolve: { extensions: ['.ts', '.tsx', '.js'] },
  module: {
    rules: [{
      test: /\.tsx?$/,
      exclude: /node_modules/,
      loader: 'builtin:swc-loader',
      options: {
        jsc: {
          parser: { syntax: 'typescript', tsx: true },
          transform: { react: { runtime: 'automatic' } },
        },
      },
    }],
  },
  plugins: [
    new HtmlRspackPlugin({
      template: './src/__fixtures__/federation-host/index.html',
    }),
    new ModuleFederationPlugin({
      name: 'documentation_test_host',
      remotes: {
        documentation: [
          'documentation_mf_remote@http://127.0.0.1:8113/remoteEntry.js',
        ],
      },
      shared: {
        'react': { singleton: true },
        'react-dom': { singleton: true },
        'react/jsx-runtime': { singleton: true, requiredVersion: false },
        'react/jsx-dev-runtime': { singleton: true, requiredVersion: false },
      },
      dts: false,
    }),
  ],
};
