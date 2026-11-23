import type { Config } from 'jest';

const esmPackages = [
  'ansi-regex',
  'indent-string',
  'min-indent',
  'redent',
  'strip-ansi',
  'strip-indent',
];

export default {
  displayName: 'cli-e2e',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      babelConfig: { plugins: ['add-module-exports'] },
    }],
  },
  transformIgnorePatterns: [`node_modules/(?!(?:${esmPackages.join('|')})/)`],
  coverageDirectory: '../../coverage/apps/cli-e2e',
  testEnvironment: 'node',
  testTimeout: 120_000,
  globalSetup: '<rootDir>/setup-jest.ts',
  setupFilesAfterEnv: ['<rootDir>/setup-jest-after-env.ts'],
  maxWorkers: 1,
} satisfies Config;
