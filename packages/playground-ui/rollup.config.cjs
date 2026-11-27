const createRollupConfig = require(
  '@codegena/infr-nx/rollup/create-unified-rollup-config.cjs',
);
const getUnifiedExternalPackages = require(
  '@codegena/infr-nx/rollup/get-unified-external-packages.cjs',
);
const { join } = require('node:path');

module.exports = createRollupConfig({
  additionalAssetDirs: [],
  externalPackages: [
    ...getUnifiedExternalPackages(join(__dirname, '../../')),
    '@codegena/graph-core',
    '@codegena/graph-ui',
    '@codegena/notification-ui-core',
    '@codegena/ui-theme',
    '@monaco-editor/react',
    'monaco-editor',
  ],
  buildLibsFromSource: false,
});
