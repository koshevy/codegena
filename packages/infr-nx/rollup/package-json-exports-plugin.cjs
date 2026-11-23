const { readJsonSync, writeJsonSync } = require('fs-extra');
const trim = require('lodash/trim');
const { join } = require('node:path');

/**
 * First level subdirectories in built package
 * @param additionalExports {string[]}
 * @param subDirectories {string[]}
 */
const packageJsonExportsPlugin = ({
  additionalExports,
  subDirectories,
}) => ({
  name: 'internal-package-json-exports-plugin',
  writeBundle: ({ dir }) => {
    const packageJsonPath = join(dir, 'package.json');
    const packageJsonContent = readJsonSync(packageJsonPath);

    packageJsonContent.exports ||= {};
    packageJsonContent.main = './index.cjs';
    packageJsonContent.module = './index.esm.js';
    packageJsonContent.types = './index.d.ts';
    // The generated manifest is published from the build output directory.
    packageJsonContent.files = [
      '**/*', '!**/*.tsbuildinfo', '!**/*.spec.*', '!**/*.test.*',
    ];

    subDirectories.forEach((entryPoint) => {
      packageJsonContent.exports[`./${entryPoint}`] = {
        types: `./${entryPoint}.d.ts`,
        import: `./${entryPoint}.esm.js`,
        module: `./${entryPoint}.esm.js`,
        require: `./${entryPoint}.cjs`,
        default: `./${entryPoint}.esm.js`,
      };
    });

    packageJsonContent.exports['.'] = packageJsonContent.exports['./index'];

    additionalExports?.forEach((additionalExport) => {
      const normalizedExport = trim(additionalExport, './');
      const relativePath = `./${normalizedExport}`;

      packageJsonContent.exports[relativePath] = {
        import: relativePath,
        require: relativePath,
      };
    });

    writeJsonSync(packageJsonPath, packageJsonContent, {
      spaces: 2,
    });
  },
});

module.exports = {
  packageJsonExportsPlugin,
};
