import type { RuleSetRule } from '@rspack/core';
import { features } from 'monaco-editor/esm/metadata.js';
import type MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';
import { createRequire } from 'node:module';
import { join, posix } from 'node:path';

/**
 * Resolve the narrow browser entry from the app's dependency tree.
 */
export function getMonacoBootstrapPath(applicationDirectory: string): string {
  const requireFromApp = createRequire(join(applicationDirectory, 'package.json'));

  return requireFromApp.resolve('@codegena/ui-unified/monaco-bootstrap');
}

export const monacoOptions: MonacoWebpackPlugin.IMonacoEditorWebpackPluginOpts = {
  languages: ['json'],
  features: [
    'browser',
    'codeEditor',
    'codicon',
    'internal',
    'tokenization',
  ],
  filename: 'monaco/[name].[contenthash].worker.js',
  publicPath: '/',
};

const featureNames: readonly string[] = monacoOptions.features ?? [];
const fullFeatureNames = new Set([
  ...featureNames,
  'bracketMatching',
  'clipboard',
  'contextmenu',
  'documentSymbols',
  'find',
  'folding',
  'format',
  'gotoError',
  'gotoLine',
  'gotoSymbol',
  'hover',
  'lineSelection',
  'links',
  'quickOutline',
  'readOnlyMessage',
  'stickyScroll',
  'toggleTabFocusMode',
  'wordOperations',
  'wordPartOperations',
]);

// Monaco 0.55 language and worker entrypoints import all features directly.
// Keep the language entrypoints on the base editor feature set.
export const monacoExcludedFeatureImports = new Set(features
  .filter(({ label }) => !featureNames.includes(label))
  .flatMap(({ entry }) => entry ?? [])
  .flatMap((entry) => {
    const path = getFeatureFile(entry).replace(/^vs\//, '');

    return [`../${path}`, `../../${path}`];
  }));

function getFeatureFile(entry: string): string {
  return entry.endsWith('.css') ? entry : `${entry}.js`;
}

export const monacoExcludedFullFeatureImports = new Set(features
  .filter(({ label }) => !fullFeatureNames.has(label))
  .flatMap(({ entry }) => entry ?? [])
  .map((entry) => {
    const path = posix.relative('vs/editor', getFeatureFile(entry));

    return path.startsWith('..') ? path : `./${path}`;
  }));

// Vite appends a version query to dependency module IDs in development.
export const monacoFullFeatureImporter
  = /[\\/]vs[\\/]editor[\\/]edcore\.main\.js(?:\?.*)?$/;

export const monacoFeatureImporters = [
  /[\\/]vs[\\/](?:language|basic-languages)[\\/]/,
  /[\\/]vs[\\/]common[\\/]workers\.js(?:\?.*)?$/,
];

function createFeatureAliases(specifiers: ReadonlySet<string>): Record<string, false> {
  return Object.fromEntries(Array.from(specifiers, (specifier) => (
    [`${specifier}$`, false] as const
  )));
}

export const monacoFeatureRule: RuleSetRule = {
  oneOf: [{
    test: monacoFeatureImporters,
    resolve: { alias: createFeatureAliases(monacoExcludedFeatureImports) },
  }, {
    test: monacoFullFeatureImporter,
    resolve: { alias: createFeatureAliases(monacoExcludedFullFeatureImports) },
  }],
};
