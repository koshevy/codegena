const { join } = require('node:path');

const oas3CorePackageName = '@codegena/oas3-core/';

module.exports = {
  name: 'resolve-oas3-core-for-cli',
  resolveId(source) {
    if (!source.startsWith(oas3CorePackageName)) {
      return null;
    }

    const entryPoint = source.slice(oas3CorePackageName.length);

    return join(__dirname, '../../../dist/oas3-core', `${entryPoint}.esm.js`);
  },
};
