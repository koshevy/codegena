module.exports = {
  displayName: 'oas3-visitor-typescript-e2e',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  testTimeout: 120000,
  transform: {
    '^.+\\.ts$': ['@swc/jest', {
      jsc: {
        parser: { syntax: 'typescript' },
        target: 'es2022',
      },
      module: { type: 'commonjs' },
    }],
  },
  coverageDirectory: '../../coverage/apps/oas3-visitor-typescript-e2e',
};
