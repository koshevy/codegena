const createRollupConfig = require(
  '@codegena/infr-nx/rollup/create-unified-rollup-config.cjs',
);
const getUnifiedExternalPackages = require(
  '@codegena/infr-nx/rollup/get-unified-external-packages.cjs',
);
const { join } = require('node:path');

module.exports = createRollupConfig({
  additionalAssetDirs: [
    './eslint-config',
    './eslint-config/exceptions-to-the-rules',
    './eslint-config/large-rules',
    './eslint-config/rule-sets',
    './rollup',
    './typings',
  ],
  externalPackages: getUnifiedExternalPackages(join(__dirname, '../../')),
});
