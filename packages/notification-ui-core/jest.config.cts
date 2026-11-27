const { readFileSync } = require('node:fs');

const swcJestConfig = JSON.parse(
  readFileSync(`${__dirname}/.spec.swcrc`, 'utf8'),
);

swcJestConfig.swcrc = false;

module.exports = {
  displayName: '@codegena/notification-ui-core',
  preset: '../../jest.preset.js',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[tj]sx?$': ['@swc/jest', swcJestConfig],
  },
  moduleFileExtensions: ['tsx', 'ts', 'js', 'html'],
  coverageDirectory: 'test-output/jest/coverage',
};
