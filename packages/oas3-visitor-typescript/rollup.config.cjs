const createRollupConfig = require(
  '@codegena/infr-nx/rollup/create-unified-rollup-config.cjs',
);

const bundleCliDependencies = require('./rollup/bundle-cli-dependencies.cjs');
const originalConfig = createRollupConfig({
  additionalAssetDirs: [],
});

module.exports = bundleCliDependencies(originalConfig);
