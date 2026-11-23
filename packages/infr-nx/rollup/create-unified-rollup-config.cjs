const { withNx } = require('@nx/rollup/with-nx');
const url = require('@rollup/plugin-url');
const svg = require('@svgr/rollup');
const { sync: globSync } = require('glob');
const {
  join,
  parse,
} = require('node:path');

const createUnifiedAssets = require('./create-unified-assets.cjs');
const { packageJsonExportsPlugin } = require('./package-json-exports-plugin.cjs');

/**
 * Create the unified rollup config for all packages.
 *
 * @param {string[]} additionalAssetDirs Paths like `['src/schemas', 'assets']`
 * @param additionalExports {string[] | undefined}
 * @param externalPackages {string[]}
 * List of external packages that should be excluded from the bundle.
 * @param buildLibsFromSource {boolean}
 * Use built declarations for workspace dependencies when false.
 *
 * @return {import('rollup').RollupOptions}
 */
const createUnifiedRollupConfig = ({
  additionalExports,
  additionalAssetDirs = [],
  externalPackages,
  buildLibsFromSource = true,
}) => {
  const cwd = process.cwd();
  const inputs = Object.fromEntries(
    globSync('*/index.{ts,tsx}', { cwd }).map((fullPath) => {
      const subdirectory = fullPath.split(/[/\\]/).at(-2);
      const entrypoint = subdirectory === 'src' ? 'index' : subdirectory;

      return [entrypoint, join(cwd, fullPath)];
    }),
  );

  const assets = createUnifiedAssets(cwd, additionalAssetDirs);
  const { name: projectName } = parse(cwd);
  const outputPath = join('dist', projectName);

  const config = withNx(
    {
      assets,
      buildLibsFromSource,
      compiler: 'tsc',
      external: externalPackages,
      format: ['esm'],
      sourceMap: true,
      tsConfig: './tsconfig.lib.json',
      outputPath,
      generateExportsField: true,
      additionalEntryPoints: [],
    },
    {
      output: {
        // Native ESM resolution requires extensions for Lodash's file subpaths.
        paths: (id) => id.startsWith('lodash/') && !id.endsWith('.js') ? `${id}.js` : id,
      },
      plugins: [
        svg({
          svgo: false,
          titleProp: true,
          ref: true,
        }),
        url({
          limit: 10000, // 10kB
        }),
        packageJsonExportsPlugin({
          additionalExports,
          subDirectories: Object.keys(inputs),
        }),
      ],
      input: inputs,
    },
  );

  // Nx derives package type from one format; CommonJS needs its own .cjs extension.
  const [esmOutput] = config.output;

  return {
    ...config,
    output: [esmOutput, {
      ...esmOutput,
      format: 'cjs',
      entryFileNames: '[name].cjs',
      chunkFileNames: '[name].cjs',
    }],
  };
};

module.exports = createUnifiedRollupConfig;
