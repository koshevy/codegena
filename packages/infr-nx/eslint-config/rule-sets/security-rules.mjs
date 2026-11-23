import browserSecurity from 'eslint-plugin-browser-security';
import jwtSecurity from 'eslint-plugin-jwt-security';
import secureCoding from 'eslint-plugin-secure-coding';

import { allCodingFileTypes } from '../file-types.mjs';

export const securityConfig = {
  files: allCodingFileTypes,
  ignores: [
    '**/*.fixture.*',
    '**/*.mock.*',
    '**/*.spec.*',
    '**/*jest*config*.*',
    '**/.spec.swcrc',
    '**/.swcrc',
    '**/__examples__/**',
    '**/__fixtures__/**',
    '**/__mocks__/**',
    '**/eslint-config/**',
    '**/fixtures/**',
    '**/jest.preset.*',
    '**/jest/**',
    '**/mocks/**',
    '**/rollup.config.*',
    '**/rollup/**',
    '**/rsbuild.config.*',
    '**/rsbuild/**',
    '**/rspack.config.*',
    '**/rspack/**',
    '**/swc.config.*',
    '**/swc/**',
    '**/vite.config.*',
    '**/vite/**',
    '**/webpack.config.*',
    '**/webpack/**',
  ],
  plugins: {
    ...browserSecurity.configs.strict.plugins,
    ...jwtSecurity.configs.strict.plugins,
    ...secureCoding.configs.strict.plugins,
  },
  rules: {
    ...browserSecurity.configs.strict.rules,
    ...jwtSecurity.configs.strict.rules,
    ...secureCoding.configs.strict.rules,
    'browser-security/no-clickjacking': [
      'error',
      { detectTransparentOverlays: false },
    ],
    'secure-coding/detect-object-injection': [
      'error',
      { allowLiterals: true },
    ],
  },
};
