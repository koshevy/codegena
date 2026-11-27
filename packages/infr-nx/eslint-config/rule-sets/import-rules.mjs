import enforceModuleBoundariesConfig
  from '../large-rules/enforce-module-boundaries.config.mjs';
import importOrderNoExtraneousDependencies
  from '../large-rules/import-no-extraneous-dependencies.config.mjs';
import importOrderConfig from '../large-rules/import-order.config.mjs';

export const importRules = {
  ...enforceModuleBoundariesConfig,
  ...importOrderConfig,
  ...importOrderNoExtraneousDependencies,
  // Keep source-tree imports behind public entrypoints without banning local paths.
  'no-restricted-imports': [
    'error',
    {
      patterns: [
        {
          regex: String.raw`^(?:\.{1,2}/)+src(?:/|$)`,
          message: 'Use the public @codegena package entrypoint.',
        },
        {
          regex: '^@codegena/[^/]+/src(?:/|$)',
          message: 'Use a public package entrypoint, not its source files.',
        },
      ],
    },
  ],
  'import/no-extraneous-dependencies': 'off',
  'import/no-cycle': 'error',
  'import/no-relative-packages': 'error',
};
