const resolveCoreForCliPlugin = require(
  '@codegena/oas3-core/rollup/resolve-oas3-core-for-cli-plugin.cjs',
);

const oas3CorePackageName = '@codegena/oas3-core/';

function bundleCliDependencies(config) {
  return {
    ...config,
    // recheck resolves its synchronous backend at runtime.
    external: (source) => (
      source === 'recheck'
      || (
        !source.startsWith(oas3CorePackageName)
        && source !== 'lodash'
        && !source.startsWith('lodash/')
        && source !== 'prettier-plugin-jsdoc'
        && source !== 'prettier/parser-typescript'
        && source !== 'prettier/standalone'
        && source !== 'regexp-tree'
        && config.external(source)
      )
    ),
    plugins: [
      resolveCoreForCliPlugin,
      ...config.plugins,
    ],
  };
}

module.exports = bundleCliDependencies;
