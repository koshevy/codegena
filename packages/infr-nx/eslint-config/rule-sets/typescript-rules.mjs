export const typescriptRules = {
  '@typescript-eslint/adjacent-overload-signatures': 'error',
  '@typescript-eslint/ban-ts-comment': 'error',
  '@typescript-eslint/class-literal-property-style': ['error', 'fields'],
  '@typescript-eslint/explicit-function-return-type': [
    'error',
    {
      allowConciseArrowFunctionExpressionsStartingWithVoid: true,
      allowDirectConstAssertionInArrowFunctions: true,
      allowExpressions: true,
      allowFunctionsWithoutTypeParameters: false,
      allowIIFEs: true,
      allowHigherOrderFunctions: true,
      allowTypedFunctionExpressions: true,
    },
  ],
  '@typescript-eslint/member-ordering': 'error',
  '@typescript-eslint/method-signature-style': 'off',
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-namespace': 'off',
  'no-unused-vars': 'off',
  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      'args': 'all',
      'argsIgnorePattern': '^_',
      'caughtErrors': 'all',
      'caughtErrorsIgnorePattern': '^_',
      'destructuredArrayIgnorePattern': '^_',
      'varsIgnorePattern': '^_',
      'ignoreRestSiblings': true,
    },
  ],
};
