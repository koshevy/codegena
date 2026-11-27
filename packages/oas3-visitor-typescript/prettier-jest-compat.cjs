// Expose a static named export to the ESM JSDoc plugin under Jest's CJS resolver.
const prettier = require('prettier/index.cjs');

exports.format = prettier.format;
