import eslint from '@eslint/js';
import globals from 'globals';

import { javascriptFileTypes } from './file-types.mjs';
import rootConfig from './root.config.mjs';

/**
 * ESLint configuration tailored for Nx plugin packages.
 *
 * This default export extends the repository base config and adds:
 * - Core JavaScript rules and Node globals for JS config and tooling files
 * - JSON parsing via `jsonc-eslint-parser`
 * - Nx-specific rules for dependency checks and plugin checks
 *
 * Intended usage: apply in Nx plugin projects inside the monorepo to ensure
 * consistent linting for JSON files and plugin-specific constraints.
 */
export default [
  ...rootConfig,
  {
    files: javascriptFileTypes,
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      ...eslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}'],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
  {
    files: ['**/package.json', '**/generators.json'],
    rules: {
      '@nx/nx-plugin-checks': 'error',
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
];
