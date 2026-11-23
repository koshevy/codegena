import css from '@eslint/css';
import styledSyntax from 'postcss-styled-syntax';
import standardCssConfig from 'stylelint-config-standard';

export const cssFileRules = {
  ...css.configs.recommended,
  files: ['**/*.css'],
  language: 'css/css',
};

/**
 * Shared Stylelint rules for MUI/Emotion template strings.
 */
export const cssRules = {
  ...standardCssConfig,
  overrides: [
    {
      files: ['**/*.{js,jsx,ts,tsx}'],
      customSyntax: styledSyntax,
      rules: {
        // These selectors are composed through interpolation and nesting.
        'block-no-redundant-nested-style-rules': null,
        'color-no-hex': true,
        'no-descending-specificity': null,
        'selector-class-pattern': null,
      },
    },
  ],
};

/**
 * Prefer lintable CSS templates in MUI/Emotion styled components.
 */
export const cssSyntaxPreferenceRules = {
  'no-restricted-syntax': [
    'warn',
    {
      selector: [
        'CallExpression[callee.type="CallExpression"]',
        '[callee.callee.name="styled"] > ObjectExpression.arguments',
      ].join(''),
      message: 'Write styled component CSS as a template string.',
    },
    {
      selector: [
        'CallExpression[callee.type="CallExpression"]',
        '[callee.callee.name="styled"] > ArrowFunctionExpression.arguments',
        ' > ObjectExpression.body',
      ].join(''),
      message: 'Write styled component CSS as a template string.',
    },
  ],
};
