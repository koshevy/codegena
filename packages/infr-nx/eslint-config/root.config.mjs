import { fixupConfigRules } from '@eslint/compat';
import nx from '@nx/eslint-plugin';
import reactNamingConvention from 'eslint-plugin-react-naming-convention';
import unicorn from 'eslint-plugin-unicorn';
import typescriptEslint from 'typescript-eslint';

import { remoteEntryRules } from './exceptions-to-the-rules/remote-entry.mjs';
import { allCodingFileTypes } from './file-types.mjs';
import { codeStandardRules } from './rule-sets/code-standard-rules.mjs';
import {
  cssFileRules,
  cssSyntaxPreferenceRules,
} from './rule-sets/css-rules.mjs';
import { environmentBoundary } from './rule-sets/environment-boundary.mjs';
import { formatingRules } from './rule-sets/formatting-rules.mjs';
import { importRules } from './rule-sets/import-rules.mjs';
import { reactRules } from './rule-sets/react-rules.mjs';
import { securityConfig } from './rule-sets/security-rules.mjs';
import { specRules } from './rule-sets/spec-rules.mjs';
import { storiesRules } from './rule-sets/stories-rules.mjs';
import { typescriptRules } from './rule-sets/typescript-rules.mjs';

const [, strict] = typescriptEslint.configs.strict;
const [, recommended] = typescriptEslint.configs.recommended;
const [, stylistic] = typescriptEslint.configs.stylistic;

/**
 * JS/TS rules that are not part of the flat config but are still needed.
 * Do not add typechecked rules here.
 *
 * Use `typecheckedForProject` to extend config for typechecked projects.
 * @see typecheckedForProject
 *
 * @example
 * ```mjs
 * // libs/project-name/eslint.config.mjs
 * import { typecheckedForProject } from '@codegena/infr-nx/eslint-config/index.mjs';
 * import baseConfig from '../../eslint.config.mjs';
 *
 * export default typecheckedForProject('/libs/project-name', baseConfig);
 * ```
 */
const nonFlatNonTypeCheckedTsJsRules = {
  ...recommended.rules,
  ...stylistic.rules,
  ...strict.rules,
};

/**
 * ESLint configuration array that provides a comprehensive linting setup for
 * TypeScript, JavaScript, React, and JSON files in a Nx monorepo.
 *
 * This configuration:
 * - Applies strict TypeScript rules via `typescript-eslint`
 * - Integrates Nx-specific linting rules for base, TypeScript, JavaScript,
 *   React, and React with TypeScript projects
 * - Configures JSON file parsing with `jsonc-eslint-parser`
 * - Enforces custom module boundary rules from a separate config
 * - Ignores the `dist` directory
 * - Enforces single quotes and a maximum line length of 90 characters for all
 *   TypeScript and JavaScript files
 */
export default [
  cssFileRules,
  {
    files: ['**/*.json'],
    // Override or add rules here
    rules: {},
    languageOptions: {
      parser: {
        ...await import('jsonc-eslint-parser'),
      },
    },
  },
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  ...fixupConfigRules([
    ...nx.configs['flat/react'],
    ...nx.configs['flat/react-jsx'],
    ...nx.configs['flat/react-typescript'],
  ]),
  {
    ignores: [
      '**/dist',
      '**/out-tsc',
      '**/storybook-static',
    ],
  },
  {
    ...formatingRules,
    files: allCodingFileTypes,
  },
  {
    files: allCodingFileTypes,
    plugins: { unicorn },
    // Override or add rules here
    rules: {
      ...codeStandardRules,
      ...cssSyntaxPreferenceRules,
      ...importRules,
      ...nonFlatNonTypeCheckedTsJsRules,
    },
  },
  {
    files: allCodingFileTypes,
    plugins: { '@eslint-react/naming-convention': reactNamingConvention },
    rules: {
      '@eslint-react/naming-convention/context-name': 'error',
    },
  },
  securityConfig,
  {
    files: allCodingFileTypes,
    plugins: { codegena: { rules: { 'environment-boundary': environmentBoundary } } },
    rules: { 'codegena/environment-boundary': 'error' },
  },
  {
    // Worker and same-origin BroadcastChannel messages do not accept the
    // targetOrigin argument required by Window.postMessage.
    files: [
      '**/conversion/convert-source-to-graph-in-worker.ts',
      '**/conversion/start-graph-conversion-worker.ts',
      '**/specification/execution/conversion-worker.ts',
      '**/specification/client/open-conversion-worker.ts',
      '**/specification/execution/request-host-conversion*.ts',
    ],
    rules: {
      'browser-security/require-postmessage-origin-check': 'off',
      'unicorn/require-post-message-target-origin': 'off',
    },
  },
  {
    files: ['**/*.jsx', '**/*.tsx'],
    rules: {
      ...reactRules,
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      ...typescriptRules,
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      ...specRules,
    },
  },
  {
    files: ['**/*.stories.ts', '**/*.stories.tsx'],
    rules: {
      ...storiesRules,
    },
  },
  {
    files: ['**/remote-entry.ts'],
    rules: {
      ...remoteEntryRules,
    },
  },
];
