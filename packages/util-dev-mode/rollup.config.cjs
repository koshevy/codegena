const createRollupConfig = require(
  '@codegena/infr-nx/rollup/create-unified-rollup-config.cjs',
);

module.exports = createRollupConfig({
  additionalAssetDirs: [],
  externalPackages: ['react', 'react/jsx-runtime'],
});
