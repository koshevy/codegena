import type { Configuration } from '@rspack/core';
import { join } from 'node:path';

export const browserServicesConfig: Configuration = {
  name: 'browser-services',
  target: 'webworker',
  devServer: false,
  entry: {
    'service-worker': '@codegena/pwa/assets/service-worker.esm.js',
    'service-worker-companion': '@codegena/pwa/assets/service-worker-companion.esm.js',
    'graph-search-api': '@codegena/graph-search-core/api',
    'specification-api': './src/services/specification/api.ts',
    'specification-conversion-worker': [
      './src/services/specification/execution/conversion-worker.ts',
    ],
  },
  output: {
    clean: true,
    path: join(__dirname, '../../dist/apps/playground-mf-remote-services'),
    filename: '[name].js',
    chunkFilename: 'services/[name].[contenthash].js',
    module: true,
    library: { type: 'module' },
  },
  resolve: {
    extensions: ['.ts', '.js'],
    conditionNames: ['worker', '...'],
    tsConfig: join(__dirname, 'tsconfig.app.json'),
  },
  module: {
    // The compiler's optional Node filesystem is unreachable in this worker.
    noParse: /[\\/]typescript[\\/]lib[\\/]typescript\.js$/,
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
