import stylistic from '@stylistic/eslint-plugin';

const stylisticConfig = stylistic.configs.customize({
  arrowParens: 'always',
  blockSpacing: true,
  commaDangle: 'always-multiline',
  indent: 2,
  jsx: true,
  quoteProps: 'consistent',
  quotes: 'single',
  printWidth: 90,
  semi: true,
  severity: 'error',
});

export const formatingRules = {
  ...stylisticConfig,
  rules: {
    ...stylisticConfig.rules,
    '@stylistic/jsx-one-expression-per-line': 'off',
    '@stylistic/no-floating-decimal': 'error',
    // Keep declaration groups apart from surrounding work. Adjacent
    // declarations may still form one related step, as CODE_STYLE rule 23 allows.
    '@stylistic/padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
      { blankLine: 'always', prev: '*', next: ['const', 'let', 'var'] },
      { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
    ],
    'camelcase': ['error', {
      allow: [
        'v7_relativeSplatPath',
        'v7_startTransition',
      ],
      ignoreDestructuring: false,
      properties: 'always',
    }],
    'max-classes-per-file': ['error', 1],
    'max-len': ['error', 90],
    'max-lines': ['error', {
      max: 300,
      skipComments: true,
    }],
    'max-params': ['error', 5],
    'no-console': ['error', {
      allow: ['warn', 'error'],
    }],
    'no-duplicate-imports': ['error', {
      // CODE_STYLE requires named type imports separate from runtime React APIs.
      allowSeparateTypeImports: true,
      includeExports: true,
    }],
    'no-obj-calls': 'error',
    'no-setter-return': 'error',
    'no-shadow': ['error', {
      builtinGlobals: false,
      hoist: 'all',
    }],
    'no-underscore-dangle': [
      'error',
      {
        allow: ['__filename', '__dirname', '_'],
        allowAfterThis: true,
        enforceInMethodNames: true,
      },
    ],
    'no-unexpected-multiline': 'error',
  },
};
