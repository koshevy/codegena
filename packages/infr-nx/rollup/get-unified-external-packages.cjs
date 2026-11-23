const { readJsonSync } = require('fs-extra');
const { join } = require('node:path');

const unifiedUiPackagesConfigFilename = '.unified-ui-packages.json';

/**
 * @param {string} workspaceRoot
 * @returns {string[]}
 */
function getUnifiedExternalPackages(workspaceRoot) {
  return readJsonSync(
    join(workspaceRoot, unifiedUiPackagesConfigFilename),
  );
}

module.exports = getUnifiedExternalPackages;
