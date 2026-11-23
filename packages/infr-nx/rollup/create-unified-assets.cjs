const { join } = require('node:path');

/**
 * @param {string} directory
 * @param {string[]} additionalDirs Paths like `['src/schemas', 'assets']`
 */
const createUnifiedAssets = (
  directory,
  additionalDirs = [],
) => [
  {
    input: directory,
    output: '.',
    glob: 'README.md',
  },
  {
    input: join(directory, 'src/styles'),
    output: './src/styles',
    glob: '*.*',
  },
  {
    input: join(directory, 'src/assets'),
    output: './src/assets',
    glob: '*.*',
  },
  {
    input: join(directory, 'assets'),
    output: './assets',
    glob: '*.*',
  },
  ...additionalDirs.map((additionalDir) => ({
    input: join(directory, additionalDir),
    output: `./${additionalDir}`,
    glob: '*.*',
  })),
];

module.exports = createUnifiedAssets;
