const createRollupConfig = require(
  '@codegena/infr-nx/rollup/create-unified-rollup-config.cjs',
);
const getUnifiedExternalPackages = require(
  '@codegena/infr-nx/rollup/get-unified-external-packages.cjs',
);
const { join } = require('node:path');

module.exports = createRollupConfig({
  additionalAssetDirs: [],
  externalPackages: getUnifiedExternalPackages(join(__dirname, '../../')),
});
