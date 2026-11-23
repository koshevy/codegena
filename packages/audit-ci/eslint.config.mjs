import rootConfig from '@codegena/infr-nx/eslint-config/root.config.mjs';

export default [
  ...rootConfig,
  {
    files: [
      'src/decide-should-be-ignored.mjs',
      'src/parse-vulnerabilities-ignore.mjs',
    ],
    rules: {
      // Node 22 and 24 lack native Temporal; this CLI must run without a polyfill.
      'unicorn/prefer-temporal': 'off',
    },
  },
];
