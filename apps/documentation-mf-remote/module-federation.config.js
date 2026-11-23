const { resolve } = require('node:path');

module.exports = {
  name: 'documentation_mf_remote',
  exposes: { './App': resolve(__dirname, 'src/remote-entry.ts') },
};
