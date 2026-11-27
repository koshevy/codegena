const reactOwnerBodySelector = [
  ':matches(',
  'FunctionDeclaration[id.name=/^[A-Z]/]',
  ':has(:matches(JSXElement, JSXFragment)) > BlockStatement,',
  'FunctionDeclaration[id.name=/^use[A-Z]/] > BlockStatement,',
  'VariableDeclarator[id.name=/^[A-Z]/] > ',
  'ArrowFunctionExpression',
  ':has(:matches(JSXElement, JSXFragment)) > BlockStatement,',
  'VariableDeclarator[id.name=/^use[A-Z]/] > ',
  'ArrowFunctionExpression > BlockStatement',
  ')',
].join('');

export const reactRules = {
  // Conditional React nodes belong in named values before the returned JSX.
  // Text choices and boolean prop expressions are separate, valid cases.
  'no-restricted-syntax': [
    'error',
    {
      selector: [
        ':matches(JSXElement, JSXFragment) > JSXExpressionContainer > ',
        ':matches(LogicalExpression[operator="&&"], ConditionalExpression)',
        ':has(:matches(JSXElement, JSXFragment))',
      ].join(''),
      message: 'Prepare the conditional child in a named value before JSX.',
    },
    // A component-local JSX lookup constructs every option on each render.
    // Hoist static icon components or memoize a lookup that depends on props.
    {
      selector: [
        'FunctionDeclaration[id.name=/^[A-Z]/] ',
        'VariableDeclarator[init.type="MemberExpression"]',
        '[init.object.type="ObjectExpression"]:has(JSXElement)',
      ].join(''),
      message: 'Hoist this JSX object lookup or wrap it in useMemo.',
    },
    {
      selector: [
        'VariableDeclarator[id.name=/^[A-Z]/] ArrowFunctionExpression ',
        'VariableDeclarator[init.type="MemberExpression"]',
        '[init.object.type="ObjectExpression"]:has(JSXElement)',
      ].join(''),
      message: 'Hoist this JSX object lookup or wrap it in useMemo.',
    },
    // A local value holding a rendered node names the UI it contains.
    {
      selector: [
        'VariableDeclarator[id.type="Identifier"]',
        '[init.type=/^(JSXElement|JSXFragment)$/]',
        ':not([id.name=/^rendered[A-Z]/])',
      ].join(''),
      message: 'Name a JSX-valued variable rendered<Part>.',
    },
    {
      selector: [
        'VariableDeclarator[id.type="Identifier"]',
        '[init.type="LogicalExpression"]',
        '[init.right.type=/^(JSXElement|JSXFragment)$/]',
        ':not([id.name=/^rendered[A-Z]/])',
      ].join(''),
      message: 'Name a JSX-valued variable rendered<Part>.',
    },
    {
      selector: [
        'VariableDeclarator[id.type="Identifier"]',
        '[init.type="ConditionalExpression"]',
        ':not([id.name=/^rendered[A-Z]/])',
        ':matches(',
        '[init.consequent.type=/^(JSXElement|JSXFragment)$/],',
        '[init.alternate.type=/^(JSXElement|JSXFragment)$/]',
        ')',
      ].join(''),
      message: 'Name a JSX-valued variable rendered<Part>.',
    },
    {
      selector: [
        'VariableDeclarator[id.type="Identifier"]',
        '[init.callee.name="useMemo"]',
        ':not([id.name=/^rendered[A-Z]/])',
        ':matches(',
        '[init.arguments.0.body.type=/^(JSXElement|JSXFragment)$/],',
        '[init.arguments.0.body.type="LogicalExpression"]',
        '[init.arguments.0.body.right.type=/^(JSXElement|JSXFragment)$/],',
        '[init.arguments.0.body.type="ConditionalExpression"]',
        '[init.arguments.0.body.consequent.type=/^(JSXElement|JSXFragment)$/],',
        '[init.arguments.0.body.type="ConditionalExpression"]',
        '[init.arguments.0.body.alternate.type=/^(JSXElement|JSXFragment)$/],',
        ':has(ArrowFunctionExpression > BlockStatement > ReturnStatement > ',
        ':matches(JSXElement, JSXFragment))',
        ')',
      ].join(''),
      message: 'Name a JSX-valued variable rendered<Part>.',
    },
    // Only functions inside React components or hooks need useCallback.
    // Module-scope functions already keep their identity between renders.
    {
      selector: [
        reactOwnerBodySelector,
        ' > VariableDeclaration > VariableDeclarator',
        '[init.type=/^(ArrowFunctionExpression|FunctionExpression)$/]',
      ].join(''),
      message: 'Wrap this local function in useCallback or move it outside.',
    },
    {
      selector: `${reactOwnerBodySelector} > FunctionDeclaration`,
      message: 'Wrap this local function in useCallback or move it outside.',
    },
    {
      selector: [
        'FunctionDeclaration[id.name=/^use[A-Z]/] > BlockStatement > ',
        'ReturnStatement > ObjectExpression > ',
        'Property[value.type=/^(ArrowFunctionExpression|FunctionExpression)$/]',
      ].join(''),
      message: 'Name this returned callback and wrap it in useCallback.',
    },
    {
      selector: [
        'VariableDeclarator[id.name=/^use[A-Z]/] > ',
        'ArrowFunctionExpression > BlockStatement > ',
        'ReturnStatement > ObjectExpression > ',
        'Property[value.type=/^(ArrowFunctionExpression|FunctionExpression)$/]',
      ].join(''),
      message: 'Name this returned callback and wrap it in useCallback.',
    },
    {
      selector: [
        'FunctionDeclaration[id.name=/^use[A-Z]/] > ',
        'BlockStatement > ReturnStatement > ',
        ':matches(ArrowFunctionExpression, FunctionExpression)',
      ].join(''),
      message: 'Name this returned callback and wrap it in useCallback.',
    },
    {
      selector: [
        'VariableDeclarator[id.name=/^use[A-Z]/] > ',
        'ArrowFunctionExpression > BlockStatement > ReturnStatement > ',
        ':matches(ArrowFunctionExpression, FunctionExpression)',
      ].join(''),
      message: 'Name this returned callback and wrap it in useCallback.',
    },
    // react/jsx-no-bind cannot inspect callbacks nested in JSX object props.
    {
      selector: [
        'JSXAttribute Property',
        '[value.type=/^(ArrowFunctionExpression|FunctionExpression)$/]',
        ':matches([key.name=/^on[A-Z]/], [key.value=/^on[A-Z]/])',
      ].join(''),
      message: 'Pass a stable handler to this nested JSX prop.',
    },
  ],
  'react-hooks/exhaustive-deps': 'error',
  'react-hooks/refs': 'error',
  'react-hooks/set-state-in-effect': 'error',
  'react-hooks/static-components': 'error',
  'react/forward-ref-uses-ref': 'error',
  'react/hook-use-state': 'error',
  'react/iframe-missing-sandbox': 'error',
  'react/jsx-boolean-value': [
    'error',
    'never',
  ],
  'react/jsx-closing-bracket-location': [
    'error',
    'line-aligned',
  ],
  'react/jsx-closing-tag-location': 'error',
  'react/jsx-curly-spacing': [
    'error',
    'never',
    { allowMultiline: true },
  ],
  'react/jsx-handler-names': [
    'error',
    {
      eventHandlerPrefix: 'handle',
      eventHandlerPropPrefix: 'on',
    },
  ],
  'react/jsx-indent': ['error', 2],
  'react/jsx-indent-props': ['error', 2],
  'react/jsx-key': [
    'error',
    {
      checkFragmentShorthand: true,
      checkKeyMustBeforeSpread: true,
    },
  ],
  'react/jsx-max-depth': ['error', { max: 4 }],
  'react/jsx-max-props-per-line': [
    'error',
    { maximum: 1, when: 'always' },
  ],
  'react/jsx-no-bind': [
    'error',
    {
      allowArrowFunctions: false,
      allowBind: false,
      allowFunctions: false,
      ignoreRefs: true,
      ignoreDOMComponents: false,
    },
  ],
  'react/jsx-no-constructed-context-values': 'error',
  'react/jsx-no-duplicate-props': [
    'error',
    {
      ignoreCase: true,
    },
  ],
  'react/jsx-no-leaked-render': 'error',
  'react/jsx-no-undef': 'error',
  'react/jsx-no-useless-fragment': 'error',
  'react/jsx-pascal-case': [
    'error',
    {
      allowAllCaps: false,
    },
  ],
  'react/jsx-wrap-multilines': [
    'error',
    {
      declaration: 'parens-new-line',
      assignment: 'parens-new-line',
      return: 'parens-new-line',
      arrow: 'parens-new-line',
      condition: 'parens-new-line',
      logical: 'parens-new-line',
      prop: 'parens-new-line',
    },
  ],
  'react/no-access-state-in-setstate': 'error',
  'react/no-array-index-key': 'error',
  'react/no-object-type-as-default-prop': 'error',
  'react/no-unstable-nested-components': 'error',
  'react/prefer-stateless-function': [
    'error',
    { ignorePureComponents: false },
  ],
  'react/require-render-return': 'error',
  'react/self-closing-comp': 'error',
  'react/sort-prop-types': [
    'error',
    {
      callbacksLast: true,
      ignoreCase: true,
      requiredFirst: true,
    },
  ],
};
