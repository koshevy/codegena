/**
 * # Config for the `import/order` ESLint rule
 *
 * Internal imports are NOT separated from external imports.
 * Why?
 *
 * 1. In some cases, WebStorm and VS Code interpret it wrongly.
 * 2. Few internal scopes are possible. There is no convenient way to support it.
 * 3. It would be a pain to maintain.
 */
export default {
  'import/order': [
    'error',
    {
      'alphabetize': {
        'order': 'asc',
        'caseInsensitive': true,
      },
      'groups': [
        ['builtin', 'external', 'internal'],
        ['parent', 'sibling'],
      ],
      'newlines-between': 'always',
      'warnOnUnassignedImports': true,
    },
  ],
};
