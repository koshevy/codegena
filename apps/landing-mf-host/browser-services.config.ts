import type { Configuration } from '@rspack/core';
import { join } from 'node:path';

/**
 * Standalone ESM entries run outside the page's federation and DOM runtime.
 */
export const browserServicesConfig: Configuration = {
  name: 'browser-services',
  target: 'webworker',
  devServer: false,
  entry: {
    'service-worker': '@codegena/pwa/assets/service-worker.esm.js',
    'service-worker-companion': '@codegena/pwa/assets/service-worker-companion.esm.js',
    'graph-search-api': '@codegena/graph-search-core/api',
  },
  output: {
    clean: true,
    path: join(__dirname, '../../dist/apps/landing-mf-host-services'),
    filename: '[name].js',
    chunkFilename: 'services/[name].[contenthash].js',
    module: true,
    library: { type: 'module' },
  },
  resolve: {
    extensions: ['.ts', '.js'],
    tsConfig: join(__dirname, 'tsconfig.app.json'),
  },
  module: {
    rules: [{
      test: /\.ts$/,
      use: {
        loader: 'builtin:swc-loader',
        options: { jsc: { parser: { syntax: 'typescript' }, target: 'es2022' } },
      },
    }],
  },
  optimization: { runtimeChunk: false, splitChunks: false },
};
